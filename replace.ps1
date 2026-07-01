$files = Get-ChildItem -Path "src\components" -Filter "*.tsx" -Recurse

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    
    if ($content -match "useColorScheme") {
        # Fix imports
        if ($content -notmatch "useAppTheme") {
            $content = $content -replace "useColorScheme,?", ""
            $content = $content -replace ",?\s*useColorScheme\s*\} from 'react-native'", "} from 'react-native'"
            $content = $content -replace "from 'react-native';", "from 'react-native';`r`nimport { useAppTheme } from '../hooks/useAppTheme';"
            # Cleanup any weird empty imports like import { } from 'react-native';
            $content = $content -replace "import\s*\{\s*\}\s*from 'react-native';", ""
        }

        # Replace standard patterns
        $content = $content -replace "const theme = useColorScheme\(\) === 'dark'\s*\?\s*'dark'\s*:\s*'light';", "const { theme } = useAppTheme();"
        $content = $content -replace 'const theme = useColorScheme\(\) === "dark"\s*\?\s*"dark"\s*:\s*"light";', "const { theme } = useAppTheme();"
        $content = $content -replace "const color_scheme = useColorScheme\(\);\s*const theme = color_scheme === 'dark'\s*\?\s*'dark'\s*:\s*'light';", "const { theme } = useAppTheme();"

        Set-Content -Path $file.FullName -Value $content -Encoding UTF8
        Write-Host "Updated $($file.FullName)"
    }
}
