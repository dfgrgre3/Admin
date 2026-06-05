# Script to update all environment variables from .env to Vercel
$EnvFiles = Get-Content -Path "d:\admin\.env"
foreach ($Line in $EnvFiles) {
    $Line = $Line.Trim()
    if ($Line -like "#*" -or $Line -eq "") {
        continue
    }
    # Split by the first '='
    $Index = $Line.IndexOf('=')
    if ($Index -le 0) {
        continue
    }
    $Key = $Line.Substring(0, $Index).Trim()
    $Value = $Line.Substring($Index + 1).Trim()
    
    # Remove surrounding double or single quotes if present
    if ($Value.StartsWith('"') -and $Value.EndsWith('"')) {
        $Value = $Value.Substring(1, $Value.Length - 2)
    } elseif ($Value.StartsWith("'") -and $Value.EndsWith("'")) {
        $Value = $Value.Substring(1, $Value.Length - 2)
    }
    
    # Remove escaped double quotes if any
    $Value = $Value -replace '\\"', '"'
    
    Write-Host "Updating variable: $Key"
    
    # Run Vercel command for production and development
    foreach ($env in "production", "development") {
        # Pipe value to vercel env add to prevent hanging on stdin
        $Value | vercel env add $Key $env --yes --force
    }
}
