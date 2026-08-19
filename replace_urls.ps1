# Reemplazar data URLs más simple
$htmlPath = "index.html"
$html = Get-Content $htmlPath -Raw -Encoding UTF8

$replacements = @{
    "img-png-1.png" = "png1"
    "img-png-2.png" = "png2"
    "img-png-3.png" = "png3"
}

# Contar cuántas URLs hay
$urls = @()
$regex = [regex]::new('src="(data:image/[^"]+)"')
foreach ($match in $regex.Matches($html)) {
    $urls += $match.Groups[1].Value
}

Write-Host "Encontradas $($urls.Count) URLs data: para reemplazar"

# Mapear cada URL única a un archivo
$counter = 0
$urlMap = @{}
foreach ($url in $urls) {
    if (-not $urlMap.ContainsKey($url)) {
        # Determinar tipo
        if ($url -match 'jpeg') {
            $ext = "jpg"
            $counter++
            $filename = "img-$counter.jpg"
        } elseif ($url -match 'png') {
            $filename = "img-$counter.png"
        }
        $urlMap[$url] = $filename
    }
}

Write-Host "Preparadas $($urlMap.Count) sustituciones únicas"

# Hacer reemplazos
$newHtml = $html
foreach ($oldUrl in $urlMap.Keys) {
    $newSrc = $urlMap[$oldUrl]
    $oldSrcAttr = 'src="' + $oldUrl + '"'
    $newSrcAttr = 'src="' + $newSrc + '"'
    $newHtml = $newHtml.Replace($oldSrcAttr, $newSrcAttr)
    Write-Host "Reemplazado: $newSrc"
}

# Guardar
$newHtml | Out-File $htmlPath -Encoding UTF8 -NoNewline

$newSize = (Get-Item $htmlPath).Length / 1MB
Write-Host ""
Write-Host "HTML actualizado: $([Math]::Round($newSize, 1)) MB"
