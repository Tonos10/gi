$srcDir = "src"

$unusedFiles = @(
  "src\components\GlassButton.tsx",
  "src\components\GlassCard.tsx",
  "src\components\GlassInput.tsx",
  "src\components\GlassPanel.tsx",
  "src\components\GlassTransactionModal.tsx",
  "src\components\LiquidGlassSurface.tsx"
)

# 1. Delete unused files
foreach ($file in $unusedFiles) {
  if (Test-Path $file) {
    Remove-Item $file -Force
    Write-Host "Deleted: $file"
  }
}

$renames = @{
  "AmountInput" = @{ file="EntradaMonto"; desc="Entrada de monto monetario" };
  "Button" = @{ file="Boton"; desc="Botón principal de la aplicación" };
  "CircularProgress" = @{ file="ProgresoCircular"; desc="Barra de progreso circular" };
  "DepositModal" = @{ file="ModalDeposito"; desc="Modal para depositar dinero" };
  "GoalCalendar" = @{ file="CalendarioMeta"; desc="Calendario para seleccionar fechas de meta" };
  "GoalCard" = @{ file="TarjetaMeta"; desc="Tarjeta que muestra información de la meta" };
  "IconButton" = @{ file="BotonIcono"; desc="Botón con icono" };
  "Input" = @{ file="Entrada"; desc="Campo de entrada de texto genérico" };
  "SwitchRow" = @{ file="FilaInterruptor"; desc="Fila con interruptor de encendido/apagado" };
  "TransactionItem" = @{ file="ElementoTransaccion"; desc="Elemento individual de transacción" };
  "TransactionModal" = @{ file="ModalTransaccion"; desc="Modal para ver detalles de transacción" };
  "WithdrawModal" = @{ file="ModalRetiro"; desc="Modal para retirar dinero" };
}

# 2. Get all ts/tsx files
$allFiles = Get-ChildItem -Path $srcDir -Recurse -Include *.ts,*.tsx -File

foreach ($fileInfo in $allFiles) {
  $file = $fileInfo.FullName
  $content = [IO.File]::ReadAllText($file, [System.Text.Encoding]::UTF8)
  $changed = $false

  foreach ($oldName in $renames.Keys) {
    $newInfo = $renames[$oldName]
    $newName = $newInfo.file
    $desc = $newInfo.desc

    # Update imports: import { OldName } from '.../OldName'
    $importRegex = "import\s+\{([^}]*)\b$oldName\b([^}]*)\}\s+from\s+['""]([^'""]+)['""]"
    if ($content -match $importRegex) {
      $content = [regex]::Replace($content, $importRegex, {
        param($match)
        $p1 = $match.Groups[1].Value
        $p2 = $match.Groups[2].Value
        $p3 = $match.Groups[3].Value
        if ($p3 -match "$oldName$") {
          $p3 = $p3 -replace "$oldName$", $newName
        }
        return "import {$p1$newName$p2} from '$p3'"
      })
      $changed = $true
    }

    # Update JSX tags: <OldName ... /> or <OldName>...</OldName>
    $jsxSelfCloseRegex = "<$oldName(\s|/)"
    if ($content -match $jsxSelfCloseRegex) {
      $content = [regex]::Replace($content, $jsxSelfCloseRegex, "<${newName}`$1")
      $changed = $true
    }
    $jsxCloseRegex = "</$oldName>"
    if ($content -match $jsxCloseRegex) {
      $content = [regex]::Replace($content, $jsxCloseRegex, "</$newName>")
      $changed = $true
    }

    # Default or named export of the component
    $exportRegex = "export\s+const\s+$oldName\s*="
    if ($content -match $exportRegex) {
      $content = [regex]::Replace($content, $exportRegex, "export const $newName =")
      $changed = $true

      $comment = "// Componente: $newName - $desc`n"
      if (-not $content.Contains("// Componente: $newName")) {
        $content = $content -replace "export\s+const\s+$newName\s*=", "$comment`export const $newName ="
      }
    }

    # function OldName( ...
    $funcRegex = "function\s+$oldName\s*\("
    if ($content -match $funcRegex) {
      $content = [regex]::Replace($content, $funcRegex, "function $newName(")
      $changed = $true

      $comment = "// Componente: $newName - $desc`n"
      if (-not $content.Contains("// Componente: $newName")) {
        $content = $content -replace "function\s+$newName\s*\(", "$comment`function $newName("
      }
    }

    # React.FC<OldNameProps> -> React.FC<NewNameProps>
    $propsRegex = "${oldName}Props"
    if ($content -match $propsRegex) {
      $content = [regex]::Replace($content, $propsRegex, "${newName}Props")
      $changed = $true
    }
  }

  if ($changed) {
    [IO.File]::WriteAllText($file, $content, [System.Text.Encoding]::UTF8)
    Write-Host "Updated content in: $file"
  }
}

# 3. Rename files
foreach ($oldName in $renames.Keys) {
  $newName = $renames[$oldName].file
  $oldPath = Join-Path -Path $srcDir -ChildPath "components\$oldName.tsx"
  $newPath = Join-Path -Path $srcDir -ChildPath "components\$newName.tsx"

  if (Test-Path $oldPath) {
    Rename-Item -Path $oldPath -NewName "$newName.tsx" -Force
    Write-Host "Renamed file: $oldName.tsx -> $newName.tsx"
  }
}

Write-Host "Refactoring complete."
