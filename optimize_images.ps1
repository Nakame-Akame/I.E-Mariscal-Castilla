# Optimizar imágenes JPG con compresor
Add-Type -AssemblyName System.Drawing

$imgDir = "img"
$images = Get-ChildItem $imgDir -Filter "*.jpg" | Where-Object { $_.Name -like "img-jpg-*" }

Write-Host "Optimizando $($images.Count) imágenes JPG..."

foreach ($img in $images) {
    $inputPath = $img.FullName
    $origSize = $img.Length / 1024

    try {
        [System.Drawing.Image]$image = [System.Drawing.Image]::FromFile($inputPath)

        # Crear encoder de JPEG con calidad reducida
        $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncodersByMimeType("image/jpeg")[0]
        $params = New-Object System.Drawing.Imaging.EncoderParameters(1)
        $params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, 75)

        # Guardar con compresión
        $image.Save($inputPath, $codec, $params)
        $image.Dispose()

        $newSize = (Get-Item $inputPath).Length / 1024
        $reduction = [Math]::Round(($origSize - $newSize) / $origSize * 100)

        Write-Host "  $($img.Name): $([Math]::Round($origSize))KB -> $([Math]::Round($newSize))KB (-$reduction%)"

    } catch {
        Write-Host "  Error optimizando $($img.Name)"
    }
}

Write-Host ""
$totalSize = (Get-ChildItem $imgDir -File | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Host "Tamaño total de carpeta img/: $([Math]::Round($totalSize, 1)) MB"
