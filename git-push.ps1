# Script para subir cambios a git
# Ejecuta este script cuando tengas git disponible

# Verificar si git está disponible
try {
    $gitVersion = git --version
    Write-Host "Git encontrado: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Git no está instalado o no está en el PATH" -ForegroundColor Red
    Write-Host "Por favor instala Git desde: https://git-scm.com/download/win" -ForegroundColor Yellow
    exit 1
}

# Verificar si hay un repositorio git
if (-not (Test-Path .git)) {
    Write-Host "Inicializando repositorio git..." -ForegroundColor Yellow
    git init
    git remote add origin https://github.com/gabrieldave/Asesorias.git
    Write-Host "Repositorio inicializado y remoto configurado" -ForegroundColor Green
} else {
    # Verificar si el remoto está configurado
    $remote = git remote get-url origin 2>$null
    if (-not $remote) {
        Write-Host "Configurando remoto..." -ForegroundColor Yellow
        git remote add origin https://github.com/gabrieldave/Asesorias.git
    } else {
        Write-Host "Remoto ya configurado: $remote" -ForegroundColor Green
    }
}

# Verificar estado
Write-Host "`nVerificando estado del repositorio..." -ForegroundColor Cyan
git status

# Agregar archivos modificados
Write-Host "`nAgregando archivos modificados..." -ForegroundColor Cyan
git add components/BookingModal.tsx

# Verificar si hay cambios para commitear
$status = git status --porcelain
if ($status) {
    # Hacer commit
    Write-Host "`nHaciendo commit..." -ForegroundColor Cyan
    git commit -m "Fix: Mejorar diseño móvil del modal de agendamiento - calendario completamente visible y funcional en móvil"
    
    # Subir cambios
    Write-Host "`nSubiendo cambios a GitHub..." -ForegroundColor Cyan
    git push -u origin main
    
    Write-Host "`n¡Cambios subidos exitosamente!" -ForegroundColor Green
} else {
    Write-Host "`nNo hay cambios para subir" -ForegroundColor Yellow
}

