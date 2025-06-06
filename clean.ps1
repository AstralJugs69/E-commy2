Write-Host "Cleaning build files..." -ForegroundColor Cyan

# Root level cleanup
if (Test-Path "node_modules") { 
    Remove-Item -Recurse -Force "node_modules"
    Write-Host "Removed root node_modules" -ForegroundColor Yellow 
}

# Admin frontend cleanup
if (Test-Path "packages/admin-frontend/dist") { 
    Remove-Item -Recurse -Force "packages/admin-frontend/dist"
    Write-Host "Removed admin-frontend dist" -ForegroundColor Yellow 
}
if (Test-Path "packages/admin-frontend/coverage") { 
    Remove-Item -Recurse -Force "packages/admin-frontend/coverage"
    Write-Host "Removed admin-frontend coverage" -ForegroundColor Yellow 
}
if (Test-Path "packages/admin-frontend/node_modules") { 
    Remove-Item -Recurse -Force "packages/admin-frontend/node_modules"
    Write-Host "Removed admin-frontend node_modules" -ForegroundColor Yellow 
}

# Customer frontend cleanup
if (Test-Path "packages/customer-frontend/dist") { 
    Remove-Item -Recurse -Force "packages/customer-frontend/dist"
    Write-Host "Removed customer-frontend dist" -ForegroundColor Yellow 
}
if (Test-Path "packages/customer-frontend/coverage") { 
    Remove-Item -Recurse -Force "packages/customer-frontend/coverage"
    Write-Host "Removed customer-frontend coverage" -ForegroundColor Yellow 
}
if (Test-Path "packages/customer-frontend/node_modules") { 
    Remove-Item -Recurse -Force "packages/customer-frontend/node_modules"
    Write-Host "Removed customer-frontend node_modules" -ForegroundColor Yellow 
}

# Backend cleanup
if (Test-Path "packages/backend/dist") { 
    Remove-Item -Recurse -Force "packages/backend/dist"
    Write-Host "Removed backend dist" -ForegroundColor Yellow 
}
if (Test-Path "packages/backend/coverage") { 
    Remove-Item -Recurse -Force "packages/backend/coverage"
    Write-Host "Removed backend coverage" -ForegroundColor Yellow 
}
if (Test-Path "packages/backend/node_modules") { 
    Remove-Item -Recurse -Force "packages/backend/node_modules"
    Write-Host "Removed backend node_modules" -ForegroundColor Yellow 
}

Write-Host "Cleanup complete!" -ForegroundColor Green
