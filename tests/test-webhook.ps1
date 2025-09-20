# Test script for n8n webhook integration
# PowerShell equivalent of curl commands

Write-Host "Testing n8n webhook integration..." -ForegroundColor Green

# Test 1: Send message directly to n8n webhook
Write-Host "`n1. Testing direct message to n8n webhook..." -ForegroundColor Yellow

$n8nUrl = "http://192.168.252.50:5678/webhook/chat_glauber"
$payload = @{
    text = "como troco a minha senha?"
    id = "12345"
    sender = "PowerShell Test"
    timestamp = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri $n8nUrl -Method POST -ContentType "application/json" -Body $payload
    Write-Host "✅ n8n webhook response:" -ForegroundColor Green
    Write-Host $response
} catch {
    Write-Host "❌ Error sending to n8n webhook:" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

# Test 2: Test our local webhook endpoint
Write-Host "`n2. Testing local webhook receiver..." -ForegroundColor Yellow

$localUrl = "http://localhost:3001/webhook/n8n"
$localPayload = @{
    message = "Teste de mensagem do n8n"
    sender = "n8n Bot"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri $localUrl -Method POST -ContentType "application/json" -Body $localPayload
    Write-Host "✅ Local webhook response:" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 3)
} catch {
    Write-Host "❌ Error sending to local webhook:" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

# Test 3: Test the n8n test endpoint
Write-Host "`n3. Testing n8n connection via test endpoint..." -ForegroundColor Yellow

$testUrl = "http://localhost:3001/api/test-n8n"
try {
    $response = Invoke-RestMethod -Uri $testUrl -Method GET
    Write-Host "✅ Test endpoint response:" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 3)
} catch {
    Write-Host "❌ Error testing n8n connection:" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

Write-Host "`n✨ Testing completed!" -ForegroundColor Green