<?php
/**
 * API Backend Intermediário para Integração com Google Gemini
 * 
 * Objetivo: Agir como um backend intermediário para gerar descrições técnicas 
 * de peças de elevadores e escadas rolantes da VerticalParts.
 * 
 * Configuração:
 * - cURL nativo (sem dependências)
 * - Modelo: Gemini 1.5 Flash
 * - CORS completo para comunicação frontend
 */

// 1. Headers CORS e Configuração de Saída
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

// Tratar requisições Pre-flight (OPTIONS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 2. Configurações da API do Google Gemini
// Variável para configuração manual pelo usuário
$apiKey = "AIzaSyCj2nWgpNghJnnyEZFjxXBkO3CHmXWc9iU"; // Gemini API Key (Atualizada)
$supabaseUrl = "https://clakkpyzinuheubkhdep.supabase.co";
$serviceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsYWtrcHl6aW51aGV1YmtoZGVwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjYxNDA2NywiZXhwIjoyMDg4MTkwMDY3fQ.NahtsZuS-IflGk7nWSipSWx5Mg-aBsg3dZRuvpre2PY"; // Supabase Service Role Key

// 3. Recebimento e Decodificação do Input (POST JSON)
$inputRaw = file_get_contents("php://input");
$input = json_decode($inputRaw, true);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Método não permitido. Use POST."]);
    exit();
}

if (!$input) {
    http_response_code(400);
    echo json_encode(["error" => "Dados de entrada JSON não encontrados ou inválidos."]);
    exit();
}

// Extração de parâmetros do corpo da requisição (Suporta nova estrutura 'context' e antiga)
// Extração de parâmetros do corpo da requisição
$action = $input['action'] ?? 'chat'; // 'chat' ou 'invite'
$history = $input['history'] ?? [];
$userInstruction = $input['user_instruction'] ?? ($input['additionalDetails'] ?? '');
$context = $input['context'] ?? [];

// 4. Fluxo de Convite de Usuário (invite-user)
if ($action === 'invite') {
    $email = $input['email'] ?? '';
    $usuario = $input['employee_id'] ?? '';
    $nome = $input['name'] ?? '';
    $nivel = $input['role'] ?? 'Operador';
    $entidade = $input['branch'] ?? 'VerticalParts Matriz';

    if (empty($email) || empty($usuario)) {
        http_response_code(400);
        echo json_encode(["error" => "E-mail e Usuário são obrigatórios."]);
        exit();
    }

    $inviteUrl = $supabaseUrl . "/auth/v1/admin/generate_link";

    // Payload para o Supabase Admin API
    $inviteData = [
        "type" => "invite",
        "email" => $email,
        "data" => [
            "usuario" => $usuario,
            "nome" => $nome,
            "nivel" => $nivel,
            "entidade" => $entidade
        ],
        "redirect_to" => "https://wmsverticalparts.com.br/auth/callback"
    ];

    $ch = curl_init($inviteUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($inviteData));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'apikey: ' . $serviceRoleKey,
        'Authorization: Bearer ' . $serviceRoleKey
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode >= 200 && $httpCode < 300) {
        echo json_encode(["success" => true, "message" => "Convite processado com sucesso."]);
    }
    else {
        http_response_code($httpCode);
        echo $response;
    }
    exit();
}

// 5. Fluxo de Chat IA (Gemini)
$url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" . $apiKey;

// Mapeamento de variáveis com fallback para compatibilidade
$manualSku = $context['sku'] ?? ($input['manualSku'] ?? 'N/A');
$category = $context['category'] ?? ($input['category'] ?? 'N/A');
$vpType = $context['vpType'] ?? ($input['vpType'] ?? 'N/A');
$attributes = $context['attributes'] ?? ($input['attributes'] ?? []);
$selectedCompatibility = $context['compatibility'] ?? ($input['selectedCompatibility'] ?? []);
$manualReference = $context['reference'] ?? ($input['manualReference'] ?? 'N/A');

// 4. Lógica de Prompt e Injeção de Contexto (Hierarquia Rigorosa)
// 1. Regras de Engenheiro Sênior (Persona)
$systemRules = "Você é um ENGENHEIRO SÊNIOR da VerticalParts especializado em documentação técnica exaustiva.\n\n" .
    "DIRETRIZ DE PRIORIDADE:\n" .
    "- A 'INSTRUÇÃO DIRETA DO USUÁRIO' (que virá logo abaixo) tem prioridade absoluta sobre o contexto técnico secundário.\n" .
    "- Se a instrução do usuário pedir para ignorar a categoria ou usar medidas específicas (mm, canais, bitola), siga a instrução dele cegamente.\n\n" .
    "DIRETRIZES DE TAMANHO:\n" .
    "- Gere uma 'Descrição' profunda com no mínimo 300 palavras.\n" .
    "- Explique tecnicamente cada detalhe fornecido.\n\n" .
    "ESTRUTURA OBRIGATÓRIA:\n" .
    "**Título:** [Nome Técnico Completo]\n\n" .
    "**Descrição:** [Mínimo 3 parágrafos técnicos profundos]\n\n" .
    "**FUNÇÃO NO SISTEMA:** [Interação com o sistema de elevador/escada]\n\n" .
    "**ESPECIFICAÇÕES TÉCNICAS:** [Dados do usuário + complementos padrão]\n\n" .
    "**OBSERVAÇÃO TÉCNICA:** [Manutenção e Segurança]";

// 5. Montagem do array de contents
$contents = [];

// Adicionar histórico (se presente)
if (is_array($history)) {
    foreach ($history as $msg) {
        $role = (isset($msg['role']) && $msg['role'] === 'user') ? 'user' : 'model';
        $text = $msg['content'] ?? ($msg['parts'][0]['text'] ?? '');
        if (!empty($text)) {
            $contents[] = ["role" => $role, "parts" => [["text" => $text]]];
        }
    }
}

// Formatar atributos técnicos
$attrContext = "";
if (is_array($attributes)) {
    foreach ($attributes as $key => $val) {
        if (!empty($val)) {
            $attrContext .= "- " . strtoupper($key) . ": $val\n";
        }
    }
}
$compContext = is_array($selectedCompatibility) ? implode(", ", $selectedCompatibility) : "N/A";

// 6. Construção do Prompt na ORDEM SOLICITADA
$userPrompt = "=== 1. REGRAS DE PERSONA (ENGENHEIRO VIRTUAL) ===\n" .
    "$systemRules\n\n" .
    "=== 2. INSTRUÇÃO DIRETA DO USUÁRIO (ORDEM PRINCIPAL) ===\n" .
    "MENSAGEM: $userInstruction\n\n" .
    "=== 3. CONTEXTO TÉCNICO SECUNDÁRIO ===\n" .
    "- TIPO VP: $vpType\n" .
    "- SKU: $manualSku\n" .
    "- CATEGORIA ATUAL: $category\n" .
    "- REFERÊNCIA: $manualReference\n" .
    "- COMPATIBILIDADE: $compContext\n" .
    "ATRIBUTOS SELECIONADOS NO FILTRO:\n" . ($attrContext ?: "- Nenhum atributo extra selecionado\n") .
    "\nCom base nesta hierarquia, onde a MENSAGEM DO USUÁRIO é soberana, gere a documentação agora:";

$contents[] = [
    "role" => "user",
    "parts" => [["text" => $userPrompt]]
];

$data = [
    "contents" => $contents,
    "generationConfig" => [
        "maxOutputTokens" => 3000,
        "temperature" => 0.9
    ]
];

// 7. Execução da Chamada via cURL Nativo (PHP)
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

// 8. Tratamento de Erros e Retorno
if ($curlError) {
    http_response_code(500);
    echo json_encode([
        "error" => "Falha na comunicação com o servidor da API (cURL).",
        "details" => $curlError
    ]);
    exit();
}

$decodedResponse = json_decode($response, true);

// Se o código HTTP não for 200 (Sucesso)
if ($httpCode !== 200) {
    echo json_encode([
        "error" => "O Google Gemini retornou um erro (HTTP $httpCode). Verifique se a sua API KEY é válida.",
        "api_response" => $decodedResponse // Retorna o JSON bruto do erro para diagnóstico
    ]);
    exit();
}

// Extração do conteúdo gerado
$generatedText = $decodedResponse['candidates'][0]['content']['parts'][0]['text'] ?? null;

if ($generatedText) {
    // Retorno de sucesso com o campo 'description'
    echo json_encode([
        "description" => $generatedText
    ]);
}
else {
    // Caso a estrutura da resposta mude ou o texto não venha
    echo json_encode([
        "error" => "Resposta inesperada da API: Campo de texto não encontrado.",
        "raw_response" => $decodedResponse
    ]);
}
?>
