Add-Type -AssemblyName PresentationCore, PresentationFramework, WindowsBase

function Export-DoneRightSvgToPng($targetSize, $outputPath) {
    $drawingGroup = New-Object System.Windows.Media.DrawingGroup

    $paths = @(
        @{
            Fill = "#6640E9"
            Tx = 90.0; Ty = 12.0
            D = "M0 0 C0.66773437 0.49628906 1.33546875 0.99257812 2.0234375 1.50390625 C12.1760407 9.63928916 19.01756606 22.19870179 21 35 C21.77166949 44.53962429 21.89334195 54.10316639 18 63 C17.64808594 63.82628906 17.29617187 64.65257813 16.93359375 65.50390625 C9.85881944 80.7975603 -1.15129172 89.82941543 -16.58203125 96.0390625 C-30.34012425 100.56169215 -45.00799602 98.90816218 -58 93 C-71.29919049 86.01003846 -80.99797617 75.40895245 -85.9375 61 C-86.32774737 59.67677712 -86.68270907 58.34258641 -87 57 C-87.18175781 56.25878906 -87.36351563 55.51757812 -87.55078125 54.75390625 C-90.19872209 38.52087762 -87.01101777 23.22345597 -77.44140625 9.81640625 C-58.12489215 -13.94707512 -24.32152974 -18.10250666 0 0 Z"
        },
        @{
            Fill = "#6A45E9"
            Tx = 70.23046875; Ty = 31.390625
            D = "M0 0 C7.00468329 4.07042245 11.61527677 10.84901968 13.76953125 18.609375 C15.29664013 27.42676886 12.62711837 34.26925994 7.76953125 41.609375 C3.01476771 47.25848693 -3.58409026 50.7988789 -10.828125 52.0625 C-19.35465833 52.6023093 -26.63844411 49.39158368 -33.1796875 44.00390625 C-38.35944048 38.51101959 -41.32570293 31.23537742 -41.85546875 23.734375 C-41.5027045 16.02221864 -37.56251061 8.33189504 -31.91796875 3.109375 C-21.47059605 -4.6345109 -11.80704973 -5.39577626 0 0 Z"
        },
        @{
            Fill = "#F3F0FC"
            Tx = 70.23046875; Ty = 31.390625
            D = "M0 0 C7.00468329 4.07042245 11.61527677 10.84901968 13.76953125 18.609375 C15.29664013 27.42676886 12.62711837 34.26925994 7.76953125 41.609375 C3.01476771 47.25848693 -3.58409026 50.7988789 -10.828125 52.0625 C-19.35465833 52.6023093 -26.63844411 49.39158368 -33.1796875 44.00390625 C-38.35944048 38.51101959 -41.32570293 31.23537742 -41.85546875 23.734375 C-41.5027045 16.02221864 -37.56251061 8.33189504 -31.91796875 3.109375 C-21.47059605 -4.6345109 -11.80704973 -5.39577626 0 0 Z M-31.23046875 11.609375 C-34.77451309 16.68917189 -34.91508807 21.62358177 -34.23046875 27.609375 C-32.74670838 33.79170988 -30.02294562 38.65464119 -24.73046875 42.359375 C-19.48327956 44.9829696 -14.0119652 45.37444521 -8.23046875 44.609375 C-1.94014651 42.08016398 3.00154706 37.39612128 5.87109375 31.25 C7.69717986 25.88289473 7.94482318 20.2801246 5.63671875 15.03515625 C2.02956835 9.32226098 -1.7534379 5.76838528 -8.23046875 3.609375 C-18.08015657 2.80531885 -23.97027743 4.67185885 -31.23046875 11.609375 Z"
        },
        @{
            Fill = "#F8F7FD"
            Tx = 69.0; Ty = 46.0
            D = "M0 0 C-0.21662169 5.65382622 -3.96672036 8.63001267 -7.75 12.375 C-8.37132813 13.02855469 -8.99265625 13.68210937 -9.6328125 14.35546875 C-14.25181452 18.9842155 -14.25181452 18.9842155 -17.77734375 19.05859375 C-20.92681666 17.55858117 -22.806775 15.69453358 -25 13 C-25 11.68 -25 10.36 -25 9 C-21.62537285 9.54723683 -19.91765 10.0549 -17 12 C-11.42572933 7.24070197 -11.42572933 7.24070197 -6.25 2.0625 C-4 0 -4 0 0 0 Z"
        }
    )

    foreach ($p in $paths) {
        $geom = [System.Windows.Media.Geometry]::Parse($p.D).Clone()
        $geom.Transform = New-Object System.Windows.Media.TranslateTransform ($p.Tx), ($p.Ty)
        $color = [System.Windows.Media.ColorConverter]::ConvertFromString($p.Fill)
        $brush = New-Object System.Windows.Media.SolidColorBrush $color
        $brush.Freeze()
        $drawing = New-Object System.Windows.Media.GeometryDrawing ($brush, $null, $geom)
        $drawingGroup.Children.Add($drawing)
    }

    # Center and scale within target box
    $scaleX = ($targetSize * 0.92) / 112.0
    $scaleY = ($targetSize * 0.92) / 111.0
    $offsetX = ($targetSize - (112.0 * $scaleX)) / 2.0
    $offsetY = ($targetSize - (111.0 * $scaleY)) / 2.0

    $transformGroup = New-Object System.Windows.Media.TransformGroup
    $transformGroup.Children.Add((New-Object System.Windows.Media.ScaleTransform $scaleX, $scaleY))
    $transformGroup.Children.Add((New-Object System.Windows.Media.TranslateTransform $offsetX, $offsetY))
    $drawingGroup.Transform = $transformGroup

    $drawingVisual = New-Object System.Windows.Media.DrawingVisual
    $drawingContext = $drawingVisual.RenderOpen()
    $drawingContext.DrawDrawing($drawingGroup)
    $drawingContext.Close()

    $pixelFormat = [System.Windows.Media.PixelFormats]::Pbgra32
    $rtb = New-Object System.Windows.Media.Imaging.RenderTargetBitmap $targetSize, $targetSize, 96, 96, $pixelFormat
    $rtb.Render($drawingVisual)

    $bitmapSource = [System.Windows.Media.Imaging.BitmapSource]$rtb
    $encoder = New-Object System.Windows.Media.Imaging.PngBitmapEncoder
    $encoder.Frames.Add([System.Windows.Media.Imaging.BitmapFrame]::Create($bitmapSource))

    $fullOutPath = [System.IO.Path]::GetFullPath($outputPath)
    $dir = [System.IO.Path]::GetDirectoryName($fullOutPath)
    if (-not (Test-Path $dir)) { [System.IO.Directory]::CreateDirectory($dir) | Out-Null }

    $stream = [System.IO.File]::Create($fullOutPath)
    $encoder.Save($stream)
    $stream.Close()
    Write-Host "Success: Exported $outputPath ($targetSize x $targetSize)"
}

Export-DoneRightSvgToPng 512 "public/icon-512.png"
Export-DoneRightSvgToPng 192 "public/icon-192.png"
Export-DoneRightSvgToPng 180 "public/apple-touch-icon.png"
Export-DoneRightSvgToPng 512 "public/logo.png"

Export-DoneRightSvgToPng 512 "Frontend/public/icon-512.png"
Export-DoneRightSvgToPng 192 "Frontend/public/icon-192.png"
Export-DoneRightSvgToPng 180 "Frontend/public/apple-touch-icon.png"
Export-DoneRightSvgToPng 512 "Frontend/public/logo.png"
