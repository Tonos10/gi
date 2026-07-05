import {
    AdEventType,
    InterstitialAd,
    MobileAds,
} from "react-native-google-mobile-ads";
import { AdConfig } from "./adConfig";

class AdManagerClass {
  private interstitial: InterstitialAd | null = null;
  private isAdsEnabled: boolean = true;
  private loaded: boolean = false;
  private isShowing: boolean = false;
  private retryCount: number = 0;
  private MAX_RETRIES: number = 3;
  private retryTimeout: ReturnType<typeof setTimeout> | null = null;
  private unsubscribers: (() => void)[] = [];
  // Listeners externos para el evento CLOSED
  private closedListeners: (() => void)[] = [];

  constructor() {
    // Inicialización perezosa (lazy) controlada desde useInterstitial
    MobileAds()
      .initialize()
      .then(() => {
        console.log("AdMob initialized");
      });
  }

  public setAdsEnabled(enabled: boolean) {
    if (this.isAdsEnabled === enabled) return;

    this.isAdsEnabled = enabled;
    if (!enabled && this.interstitial) {
      this.cleanup();
    } else if (enabled && !this.interstitial) {
      this.initInterstitial();
    }
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
    if (!this.isAdsEnabled) return;

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
    if (this.isAdsEnabled && this.interstitial && !this.loaded) {
      this.interstitial.load();
    } else if (this.isAdsEnabled && !this.interstitial) {
      this.initInterstitial();
    }
  }

  public async showInterstitial(): Promise<boolean> {
    if (!this.isAdsEnabled) return false;

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
      this.closedListeners = this.closedListeners.filter((cb) => cb !== callback);
    };
  }
}

// Exportar como Singleton
export const AdManager = new AdManagerClass();
