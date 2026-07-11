import {
    AdEventType,
    AdsConsent,
    AdsConsentStatus,
    InterstitialAd,
    MobileAds,
} from "react-native-google-mobile-ads";
import { AdConfig, areAdsSupported } from "./adConfig";

class AdManagerClass {
  private interstitial: InterstitialAd | null = null;
  private initializationPromise: Promise<void> | null = null;
  private isAdsEnabled: boolean = true;
  private canRequestAds: boolean = false;
  private loaded: boolean = false;
  private isShowing: boolean = false;
  private retryCount: number = 0;
  private MAX_RETRIES: number = 3;
  private retryTimeout: ReturnType<typeof setTimeout> | null = null;
  private unsubscribers: (() => void)[] = [];
  // Listeners externos para el evento CLOSED
  private closedListeners: (() => void)[] = [];

  private shouldUseAds() {
    return areAdsSupported && this.isAdsEnabled && this.canRequestAds;
  }

  public setCanRequestAds(canRequestAds: boolean) {
    this.canRequestAds = canRequestAds;
  }

  private shouldRetryAdError(error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return !message.includes("Unable to obtain a JavascriptEngine");
  }

  private ensureInitialized() {
    if (!this.shouldUseAds()) {
      return Promise.resolve();
    }

    if (!this.initializationPromise) {
      this.initializationPromise = MobileAds()
        .initialize()
        .then(() => {
          console.log("AdMob initialized");
        })
        .catch((error) => {
          this.initializationPromise = null;
          throw error;
        });
    }

    return this.initializationPromise;
  }

  public setAdsEnabled(enabled: boolean) {
    if (this.isAdsEnabled === enabled) return;

    this.isAdsEnabled = enabled;
    if (!this.shouldUseAds() && this.interstitial) {
      this.cleanup();
    } else if (this.shouldUseAds() && !this.interstitial) {
      this.initInterstitial();
    }
  }

  public async initialize() {
    await this.ensureInitialized();
  }

  private cleanup() {
    this.unsubscribers.forEach((unsub) => unsub());
    this.unsubscribers = [];
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
      this.retryTimeout = null;
    }
    this.interstitial = null;
    this.loaded = false;
    this.isShowing = false;
  }

  public getAdsEnabled(): boolean {
    return this.isAdsEnabled;
  }

  private initInterstitial() {
    if (!this.shouldUseAds()) return;

    this.interstitial = InterstitialAd.createForAdRequest(
      AdConfig.interstitialId,
      {
        keywords: ["finance", "saving", "money", "budget"],
      },
    );

    this.unsubscribers.push(
      this.interstitial.addAdEventListener(AdEventType.LOADED, () => {
        this.loaded = true;
        this.retryCount = 0;
      }),
    );

    this.unsubscribers.push(
      this.interstitial.addAdEventListener(AdEventType.ERROR, (error) => {
        console.warn("Interstitial Ad Error:", error);
        this.loaded = false;
        this.isShowing = false;

        if (!this.shouldRetryAdError(error)) {
          return;
        }

        // Retry policy simple para evitar loops infinitos
        if (this.retryCount < this.MAX_RETRIES) {
          this.retryCount++;
          if (this.retryTimeout) clearTimeout(this.retryTimeout);
          this.retryTimeout = setTimeout(() => {
            this.retryTimeout = null;
            this.preload();
          }, 5000 * this.retryCount);
        }
      }),
    );

    this.unsubscribers.push(
      this.interstitial.addAdEventListener(AdEventType.CLOSED, () => {
        this.loaded = false;
        this.isShowing = false;
        // Notificar a los listeners externos (ej: pantallas con acción pendiente)
        this.closedListeners.forEach((cb) => cb());
        // Precargar inmediatamente el siguiente anuncio tras cerrar
        this.preload();
      }),
    );

    this.preload();
  }

  public preload() {
    if (!this.shouldUseAds()) return;

    void this.ensureInitialized()
      .then(() => {
        if (this.shouldUseAds() && this.interstitial && !this.loaded) {
          this.interstitial.load();
        } else if (this.shouldUseAds() && !this.interstitial) {
          this.initInterstitial();
        }
      })
      .catch((error) => {
        console.warn("AdMob initialization failed:", error);
      });
  }

  public async showInterstitial(): Promise<boolean> {
    if (!this.shouldUseAds()) return false;

    try {
      await this.ensureInitialized();
    } catch (error) {
      console.warn("AdMob initialization failed:", error);
      return false;
    }

    // Si no está cargado o ya se está mostrando, no intentamos mostrar y forzamos la carga.
    if (!this.interstitial || !this.loaded || this.isShowing) {
      this.preload();
      return false;
    }

    try {
      this.isShowing = true;
      await this.interstitial.show();
      return true;
    } catch (e) {
      console.error("Error showing interstitial:", e);
      this.isShowing = false;
      return false;
    }
  }

  /**
   * Permite a un componente suscribirse al evento CLOSED del interstitial.
   * Devuelve una función para desuscribirse (ideal para useEffect cleanup).
   */
  public onAdClosed(callback: () => void): () => void {
    this.closedListeners.push(callback);
    return () => {
      this.closedListeners = this.closedListeners.filter(
        (cb) => cb !== callback,
      );
    };
  }
}

// Exportar como Singleton
export const AdManager = new AdManagerClass();

export async function initializeAdsWithConsent() {
  try {
    const consentInfo = await AdsConsent.requestInfoUpdate();

    let latestConsentInfo = consentInfo;

    if (
      consentInfo.isConsentFormAvailable &&
      consentInfo.status === AdsConsentStatus.REQUIRED
    ) {
      latestConsentInfo = await AdsConsent.showForm();
    }

    AdManager.setCanRequestAds(latestConsentInfo.canRequestAds);

    if (latestConsentInfo.canRequestAds) {
      await AdManager.initialize();
      AdManager.preload();
    }
  } catch (error) {
    console.warn("Ads consent initialization failed:", error);
  }
}
