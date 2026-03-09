<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$input = json_decode(file_get_contents("php://input"), true);
if (!$input) {
    echo json_encode(["error" => "Dados inválidos."]);
    exit();
}

$apiKey = "AIzaSyBR-SNtrQAjJ4geBDyXCPc_K2QM53evP88";

$url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" . $apiKey;

$history = $input['history'] ?? [];
$currentMsg = $input['additionalDetails'] ?? '';

// INSTRUÇÃO DE SISTEMA FLEXÍVEL (SABE CONVERSAR E SABE SER TÉCNICA)
$systemInstruction = "Você é um ASSISTENTE TÉCNICO E ENGENHEIRO SÊNIOR da VerticalParts. Seu papel é ajudar o usuário a documentar peças de elevadores e escadas rolantes.\n\n";
$systemInstruction .= "COMPORTAMENTO:\n";
$systemInstruction .= "1. Se o usuário apenas te cumprimentar (ex: 'Olá', 'Tudo bem?'), responda de forma cordial apresentando-se como o assistente do WMS VerticalParts.\n";
$systemInstruction .= "2. Se houver dados de produto (SKU, Categoria) e ele pedir uma descrição, siga RIGOROSAMENTE o estilo do exemplo abaixo (Título Negrito, Função no Sistema, Especificações Técnicas e Observação).\n\n";
$systemInstruction .= "### EXEMPLO DE PADRÃO TÉCNICO (APLICAR QUANDO GERAR PRODUTOS) ###\n";
$systemInstruction .= "**Título:** [NOME DO ITEM]\n\n**Descrição:** [Texto Rico]\n\n**FUNÇÃO NO SISTEMA**\n[Detalhes]\n\n**ESPECIFICAÇÕES TÉCNICAS**\n[Lista]\n\n**OBSERVAÇÃO TÉCNICA**\n[Dicas]\n\n";
$systemInstruction .= "-----------------\n";
$systemInstruction .= "Sempre use português técnico profissional.";

$contents = [];
foreach ($history as $msg) {
    $role = ($msg['role'] === 'user') ? 'user' : 'model';
    $contents[] = ["role" => $role, "parts" => [["text" => $msg['content']]]];
}

$userPrompt = "DADOS DE CONTEXTO (CASO DISPONÍVEL):\n- SKU: " . ($input['manualSku'] ?? 'N/A') . "\n- CATEGORIA: " . ($input['category'] ?? 'N/A') . "\n\nMINHA MENSAGEM: " . $currentMsg;

$contents[] = ["role" => "user", "parts" => [["text" => $systemInstruction . "\n\n" . $userPrompt]]];

$data = ["contents" => $contents];

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);

$response = curl_exec($ch);
$result = json_decode($response, true);
$text = $result['candidates'][0]['content']['parts'][0]['text'] ?? "IA momentaneamente indisponível.";

echo json_encode(["description" => $text]);
?>
