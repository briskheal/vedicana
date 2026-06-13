$chakras = @(
    @{ name = "root_lam"; text = "Lam" },
    @{ name = "sacral_vam"; text = "Vam" },
    @{ name = "solar_ram"; text = "Ram" },
    @{ name = "heart_yam"; text = "Yam" },
    @{ name = "throat_ham"; text = "Ham" },
    @{ name = "thirdeye_om"; text = "Om" },
    @{ name = "crown_ah"; text = "Ah" }
)

foreach ($c in $chakras) {
    $url = "https://translate.google.com/translate_tts?ie=UTF-8&tl=hi&client=tw-ob&q=" + $c.text
    $dest = "public\audio\" + $c.name + ".mp3"
    Invoke-WebRequest -Uri $url -OutFile $dest
    Write-Host "Downloaded" $c.name
}
