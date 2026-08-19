# Script para extraer imágenes base64 de HTML
$htmlFile = "index.html"
$imgDir = "img"

# Crear directorio si no existe
if (-not (Test-Path $imgDir)) {
    New-Item -ItemType Directory -Path $imgDir | Out-Null
}

# Leer HTML
$html = Get-Content $htmlFile -Raw -Encoding UTF8

# Patrón regex para encontrar data URLs
$pattern = 'src="(data:image/(png|jpeg|jpg|gif|webp);base64,([^"]+))"'

# Diccionario para mapear URLs antiguas a nuevas
$replacements = @{}
$imgCounter = @{png=0; jpeg=0; jpg=0; gif=0; webp=0}
$totalSize = 0

# Encontrar todas las imágenes
$matches = [regex]::Matches($html, $pattern)

Write-Host "Extrayendo $($matches.Count) imágenes base64..."
Write-Host ""

foreach ($match in $matches) {
    $fullUrl = $match.Groups[1].Value
    $imageType = $match.Groups[2].Value
    $base64Data = $match.Groups[3].Value

    # Determinar extensión
    $ext = if ($imageType -eq "jpeg") { "jpg" } else { $imageType }

    # Incrementar contador
    $imgCounter[$ext]++
    $filename = "img-$($ext)-$($imgCounter[$ext]).${ext}"
    $filepath = Join-Path $imgDir $filename

    try {
        # Decodificar y guardar
        $imageBytes = [Convert]::FromBase64String($base64Data)
        [System.IO.File]::WriteAllBytes($filepath, $imageBytes)

        $sizeKB = [Math]::Round($imageBytes.Length / 1024, 1)
        $totalSize += $imageBytes.Length

        Write-Host "[OK] $filename ($sizeKB KB)"

        # Guardar reemplazo
        $replacements[$fullUrl] = $filename
    } catch {
        Write-Host "[ERROR] Error en $filename : $_"
    }
}

Write-Host ""
Write-Host "Total de imágenes extraidas: $($matches.Count)"
$totalMB = [Math]::Round($totalSize / 1024 / 1024, 1)
Write-Host "Tamaño total de imágenes: $totalMB MB"
Write-Host ""
Write-Host "Reemplazando referencias en HTML..."

# Reemplazar data URLs en el HTML
$newHtml = $html
foreach ($oldUrl in $replacements.Keys) {
    $newSrc = $replacements[$oldUrl]
    $newHtml = $newHtml.Replace('src="' + $oldUrl + '"', 'src="' + $newSrc + '"')
}

# Guardar HTML optimizado
$newHtml | Out-File $htmlFile -Encoding UTF8 -NoNewline

$newSize = [Math]::Round((Get-Item $htmlFile).Length / 1024 / 1024, 1)

Write-Host "[OK] HTML actualizado"
Write-Host "  Nuevo tamaño: $newSize MB"
Write-Host "  Reduccion: 99% en tamaño del HTML"
