#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generate professional credentials PDF for WMS VerticalParts project.
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, KeepTogether
)
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT
from reportlab.platypus.flowables import Flowable
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import os

# ─── Color Palette ────────────────────────────────────────────────────────────
DARK_BG      = colors.HexColor('#1a1a2e')
ACCENT       = colors.HexColor('#F2C94C')  # yellow
SECTION_BG   = colors.HexColor('#16213e')
ROW_ALT      = colors.HexColor('#f8f8f8')
ROW_WHITE    = colors.white
HEADER_TEXT  = colors.white
BORDER_COLOR = colors.HexColor('#dee2e6')
SUBTEXT      = colors.HexColor('#6c757d')
BODY_TEXT    = colors.HexColor('#212529')
NOTE_BG      = colors.HexColor('#fff3cd')
NOTE_BORDER  = colors.HexColor('#ffc107')
WARNING_BG   = colors.HexColor('#f8d7da')
WARNING_BORDER = colors.HexColor('#dc3545')

# ─── Output path ──────────────────────────────────────────────────────────────
OUTPUT_PATH = r'C:\Users\gelso\Projetos_Antigravity\WMS_VerticalParts\CREDENCIAIS_WMS_VerticalParts.pdf'

# ─── Custom Flowable: VP Logo Circle ──────────────────────────────────────────
class VPLogo(Flowable):
    def __init__(self, x, y, radius=14):
        Flowable.__init__(self)
        self.x = x
        self.y = y
        self.radius = radius
        self.width = 0
        self.height = 0

    def draw(self):
        c = self.canv
        c.setFillColor(ACCENT)
        c.circle(self.x, self.y, self.radius, fill=1, stroke=0)
        c.setFillColor(DARK_BG)
        c.setFont('Helvetica-Bold', 13)
        c.drawCentredString(self.x, self.y - 4.5, 'VP')


# ─── Helper: truncate long strings ────────────────────────────────────────────
ANON_KEY_FULL = (
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
    '.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsYWtrcHl6aW51aGV1YmtoZGVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2MTQwNjcsImV4cCI6MjA4ODE5MDA2N30'
    '.T_GQWd3i1btsVMHOeajtf16xWNnqS13nPUENg_z4Iuk'
)
ANON_KEY_SHORT = ANON_KEY_FULL[:48] + '...\n(ver arquivo .env.production no projeto)'

GEMINI_KEY = 'AIzaSyDtmwkQY7MM4SYN1_jNqchFz06WZpxg8Gk'


def build_pdf():
    page_w, page_h = A4
    margin = 18 * mm

    doc = SimpleDocTemplate(
        OUTPUT_PATH,
        pagesize=A4,
        leftMargin=margin,
        rightMargin=margin,
        topMargin=10 * mm,
        bottomMargin=20 * mm,
        title='CREDENCIAIS DO SISTEMA — WMS VerticalParts',
        author='WMS VerticalParts',
        subject='Documento Confidencial',
    )

    # ── Styles ────────────────────────────────────────────────────────────────
    def s(name, **kw):
        return ParagraphStyle(name, **kw)

    style_normal = s('Normal', fontName='Helvetica', fontSize=9, leading=13,
                     textColor=BODY_TEXT)
    style_small  = s('Small',  fontName='Helvetica', fontSize=7.5, leading=11,
                     textColor=SUBTEXT)
    style_mono   = s('Mono',   fontName='Helvetica', fontSize=7.5, leading=11,
                     textColor=BODY_TEXT)
    style_section_title = s('SectionTitle', fontName='Helvetica-Bold',
                             fontSize=10.5, textColor=ACCENT, leading=14)
    style_obs    = s('Obs',    fontName='Helvetica-Oblique', fontSize=8,
                     leading=11, textColor=SUBTEXT)
    style_warning = s('Warning', fontName='Helvetica-Bold', fontSize=8.5,
                      leading=13, textColor=colors.HexColor('#721c24'))
    style_center = s('Center', fontName='Helvetica', fontSize=8, leading=11,
                     textColor=SUBTEXT, alignment=TA_CENTER)
    style_key    = s('Key',    fontName='Helvetica', fontSize=7, leading=10,
                     textColor=BODY_TEXT, wordWrap='CJK')

    story = []
    usable_w = page_w - 2 * margin

    # ── PAGE HEADER (drawn via on-page canvas callback) ───────────────────────
    # We build header as a Table that looks like a dark banner

    def header_table():
        col1 = usable_w * 0.12
        col2 = usable_w * 0.88
        logo_para = Paragraph(
            '<font color="#F2C94C"><b>VP</b></font>',
            ParagraphStyle('LogoInner', fontName='Helvetica-Bold',
                           fontSize=18, alignment=TA_CENTER,
                           textColor=ACCENT)
        )
        title_para = Paragraph(
            'CREDENCIAIS DO SISTEMA — WMS VerticalParts',
            ParagraphStyle('HTitle', fontName='Helvetica-Bold', fontSize=14,
                           textColor=colors.white, leading=18)
        )
        sub_para = Paragraph(
            'Documento Confidencial &nbsp;|&nbsp; Guardar em local seguro &nbsp;|&nbsp; '
            'Data: 17/03/2026 &nbsp;|&nbsp; Versão: v4.3.23',
            ParagraphStyle('HSub', fontName='Helvetica', fontSize=8,
                           textColor=colors.HexColor('#adb5bd'), leading=12)
        )
        tbl = Table(
            [[logo_para, [title_para, sub_para]]],
            colWidths=[col1, col2],
            rowHeights=[None]
        )
        tbl.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), DARK_BG),
            ('VALIGN',     (0, 0), (-1, -1), 'MIDDLE'),
            ('LEFTPADDING',  (0, 0), (0, 0), 8),
            ('RIGHTPADDING', (0, 0), (0, 0), 4),
            ('LEFTPADDING',  (1, 0), (1, 0), 6),
            ('TOPPADDING',   (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING',(0, 0), (-1, -1), 10),
            ('ROUNDEDCORNERS', [4, 4, 4, 4]),
        ]))
        return tbl

    story.append(header_table())
    story.append(Spacer(1, 6 * mm))

    # ── Section builder ───────────────────────────────────────────────────────
    def section_header(num, title, icon=''):
        badge = Paragraph(
            f'<font color="#F2C94C"><b>{num}</b></font>',
            ParagraphStyle('Badge', fontName='Helvetica-Bold', fontSize=11,
                           textColor=ACCENT, alignment=TA_CENTER)
        )
        label = Paragraph(
            f'<b>{icon}  {title}</b>' if icon else f'<b>{title}</b>',
            ParagraphStyle('SecLabel', fontName='Helvetica-Bold', fontSize=10.5,
                           textColor=ACCENT, leading=14)
        )
        tbl = Table(
            [[badge, label]],
            colWidths=[10 * mm, usable_w - 10 * mm],
        )
        tbl.setStyle(TableStyle([
            ('BACKGROUND',   (0, 0), (-1, -1), SECTION_BG),
            ('VALIGN',       (0, 0), (-1, -1), 'MIDDLE'),
            ('TOPPADDING',   (0, 0), (-1, -1), 7),
            ('BOTTOMPADDING',(0, 0), (-1, -1), 7),
            ('LEFTPADDING',  (0, 0), (0, 0), 8),
            ('LEFTPADDING',  (1, 0), (1, 0), 4),
            ('LINEBELOW',    (0, 0), (-1, -1), 2, ACCENT),
        ]))
        return tbl

    def obs_row(text):
        p = Paragraph(f'ℹ  {text}', style_obs)
        tbl = Table([[p]], colWidths=[usable_w])
        tbl.setStyle(TableStyle([
            ('BACKGROUND',   (0, 0), (-1, -1), NOTE_BG),
            ('TOPPADDING',   (0, 0), (-1, -1), 5),
            ('BOTTOMPADDING',(0, 0), (-1, -1), 5),
            ('LEFTPADDING',  (0, 0), (-1, -1), 8),
            ('LINERIGHT',    (0, 0), (0, -1),  3, NOTE_BORDER),
            ('LINELEFT',     (0, 0), (0, -1),  3, NOTE_BORDER),
            ('BOX',          (0, 0), (-1, -1), 0.5, NOTE_BORDER),
        ]))
        return tbl

    def cred_table(rows, col_widths=None):
        """
        rows: list of (field, value) tuples
        """
        if col_widths is None:
            col_widths = [usable_w * 0.38, usable_w * 0.62]

        data = []
        # header row
        data.append([
            Paragraph('<b>Campo</b>', ParagraphStyle(
                'TH', fontName='Helvetica-Bold', fontSize=8.5,
                textColor=colors.white)),
            Paragraph('<b>Valor</b>', ParagraphStyle(
                'TH', fontName='Helvetica-Bold', fontSize=8.5,
                textColor=colors.white)),
        ])
        for i, (field, value) in enumerate(rows):
            data.append([
                Paragraph(field, ParagraphStyle(
                    f'TDf{i}', fontName='Helvetica-Bold', fontSize=8,
                    textColor=BODY_TEXT, leading=11)),
                Paragraph(value, ParagraphStyle(
                    f'TDv{i}', fontName='Helvetica', fontSize=8,
                    textColor=BODY_TEXT, leading=11, wordWrap='CJK')),
            ])

        style_cmds = [
            ('BACKGROUND',   (0, 0), (-1, 0),  DARK_BG),
            ('TEXTCOLOR',    (0, 0), (-1, 0),  colors.white),
            ('VALIGN',       (0, 0), (-1, -1), 'TOP'),
            ('TOPPADDING',   (0, 0), (-1, -1), 5),
            ('BOTTOMPADDING',(0, 0), (-1, -1), 5),
            ('LEFTPADDING',  (0, 0), (-1, -1), 8),
            ('RIGHTPADDING', (0, 0), (-1, -1), 8),
            ('BOX',          (0, 0), (-1, -1), 0.5, BORDER_COLOR),
            ('INNERGRID',    (0, 0), (-1, -1), 0.3, BORDER_COLOR),
            ('LINEBELOW',    (0, 0), (-1, 0),  1, ACCENT),
        ]
        for i in range(1, len(data)):
            bg = ROW_ALT if i % 2 == 0 else ROW_WHITE
            style_cmds.append(('BACKGROUND', (0, i), (-1, i), bg))

        tbl = Table(data, colWidths=col_widths, repeatRows=1)
        tbl.setStyle(TableStyle(style_cmds))
        return tbl

    def sub_title(text):
        return Paragraph(
            f'<b>{text}</b>',
            ParagraphStyle('SubTitle', fontName='Helvetica-Bold', fontSize=8.5,
                           textColor=BODY_TEXT, leading=12,
                           spaceBefore=6, spaceAfter=2)
        )

    sp = lambda h=4: Spacer(1, h * mm)

    # ════════════════════════════════════════════════════════════════════════
    # SECTION 1 — HOSTINGER
    # ════════════════════════════════════════════════════════════════════════
    story.append(KeepTogether([
        section_header('1', 'HOSTINGER — Hospedagem', '🌐'),
        sp(2),
        obs_row('Fazer login com e-mail e senha da conta Hostinger'),
        sp(2),
        cred_table([
            ('E-mail da conta',  'wmsverticalparts@gmail.com (verificar e-mail cadastrado)'),
            ('Senha do hPanel',  '[SENHA DA CONTA HOSTINGER — verificar e-mail de cadastro]'),
            ('Servidor',         'srv1893.hstgr.io'),
            ('IP do servidor',   '147.93.37.125'),
            ('Porta FTP',        '21'),
            ('URL de acesso',    'https://hpanel.hostinger.com'),
        ]),
        sp(3),
        sub_title('FTP — Conta Principal'),
        cred_table([
            ('FTP Usuário principal', 'u352534559'),
            ('FTP Senha principal',   '[DEFINIR — clicar em "Change FTP password" no hPanel]'),
        ]),
        sp(2),
        sub_title('FTP — Sub-conta GitHub Actions (deploy automático)'),
        cred_table([
            ('FTP Usuário', 'u352534559.wmsgithub'),
            ('FTP Senha',   'Papa0202%@'),
            ('Diretório',   '/public_html'),
        ]),
        sp(2),
        sub_title('Gerenciador de Arquivos Online'),
        cred_table([
            ('URL', 'https://srv1893-files.hstgr.io/cf7a93c33e53c1b8/files/public_html/'),
        ]),
    ]))

    story.append(sp(5))

    # ════════════════════════════════════════════════════════════════════════
    # SECTION 2 — SUPABASE
    # ════════════════════════════════════════════════════════════════════════
    story.append(KeepTogether([
        section_header('2', 'SUPABASE — Banco de Dados', '🗄'),
        sp(2),
        obs_row('Fazer login com a conta Google ou e-mail cadastrado no Supabase'),
        sp(2),
        cred_table([
            ('Dashboard',       'https://supabase.com/dashboard/org/bebviwvggsnqgyqjgfhk'),
            ('Organização',     'bebviwvggsnqgyqjgfhk'),
            ('Nome do projeto', 'gelsonsimoes'),
            ('Project ID',      'clakkpyzinuheubkhdep'),
            ('Project URL',     'https://clakkpyzinuheubkhdep.supabase.co'),
            ('Região',          'us-east-1'),
            ('URL de acesso',   'https://supabase.com/dashboard'),
        ]),
        sp(3),
        sub_title('Chaves da API (usar no código)'),
        cred_table([
            ('Anon Key (pública)',
             ANON_KEY_SHORT),
        ]),
        sp(2),
        sub_title('Projeto Secundário (wmsverticalparts@gmail.com)'),
        cred_table([
            ('Project ID',   'btdlxltakfridqbdturl'),
            ('Organização',  'jozpioxfaksgsqkzwjsz'),
        ]),
    ]))

    story.append(sp(5))

    # ════════════════════════════════════════════════════════════════════════
    # SECTION 3 — GITHUB
    # ════════════════════════════════════════════════════════════════════════
    story.append(KeepTogether([
        section_header('3', 'GITHUB — Repositório de Código', '💻'),
        sp(2),
        obs_row('Fazer login com usuário e senha GitHub'),
        sp(2),
        cred_table([
            ('Usuário',            'gelsonsimoes'),
            ('Repositório',        'wms-verticalparts'),
            ('URL do repositório', 'https://github.com/gelsonsimoes/wms-verticalparts'),
            ('Branch principal',   'main'),
            ('URL de acesso',      'https://github.com'),
        ]),
        sp(3),
        sub_title('GitHub Actions Secrets (configurados em Settings → Secrets → Actions)'),
        cred_table([
            ('FTP_USERNAME',          'u352534559.wmsgithub'),
            ('FTP_PASSWORD',          'Papa0202%@'),
            ('VITE_SUPABASE_URL',     'https://clakkpyzinuheubkhdep.supabase.co'),
            ('VITE_SUPABASE_ANON_KEY', ANON_KEY_SHORT),
            ('VITE_GEMINI_API_KEY',   GEMINI_KEY),
        ]),
    ]))

    story.append(sp(5))

    # ════════════════════════════════════════════════════════════════════════
    # SECTION 4 — RAILWAY
    # ════════════════════════════════════════════════════════════════════════
    story.append(KeepTogether([
        section_header('4', 'RAILWAY — Backend / API de IA', '🚂'),
        sp(2),
        obs_row('Fazer login com conta GitHub (mesmo usuário: gelsonsimoes)'),
        sp(2),
        cred_table([
            ('URL do backend', 'https://wms-verticalparts-production.up.railway.app'),
            ('Deploy',         'Automático via push no GitHub (branch main)'),
            ('Serviço',        'Express.js + Gemini AI'),
            ('Endpoints',      '/api/chat, /api/generate-description'),
            ('URL de acesso',  'https://railway.app'),
        ]),
    ]))

    story.append(sp(5))

    # ════════════════════════════════════════════════════════════════════════
    # SECTION 5 — GOOGLE GEMINI API
    # ════════════════════════════════════════════════════════════════════════
    story.append(KeepTogether([
        section_header('5', 'GOOGLE GEMINI API — Inteligência Artificial', '🤖'),
        sp(2),
        obs_row('Fazer login com conta Google em https://aistudio.google.com/apikey'),
        sp(2),
        cred_table([
            ('API Key',              GEMINI_KEY),
            ('Modelo utilizado',     'gemini-2.0-flash'),
            ('Console Google Cloud', 'https://console.cloud.google.com'),
        ]),
    ]))

    story.append(sp(5))

    # ════════════════════════════════════════════════════════════════════════
    # SECTION 6 — SITE EM PRODUÇÃO
    # ════════════════════════════════════════════════════════════════════════
    story.append(KeepTogether([
        section_header('6', 'SITE EM PRODUÇÃO', '🌍'),
        sp(2),
        cred_table([
            ('URL do site',       'https://wmsverticalparts.com.br'),
            ('Versão atual',      'v4.3.23'),
            ('Deploy frontend',   'Automático: GitHub → GitHub Actions → Hostinger FTP'),
            ('Deploy backend',    'Automático: GitHub → Railway'),
        ]),
    ]))

    story.append(sp(6))

    # ════════════════════════════════════════════════════════════════════════
    # WARNING FOOTER BOX
    # ════════════════════════════════════════════════════════════════════════
    warning_lines = [
        '<b>⚠  ATENCAO: Este documento contém informações confidenciais.</b>',
        'Armazene em gerenciador de senhas (Bitwarden, 1Password) ou local criptografado.',
        'Nunca compartilhe por e-mail, WhatsApp ou chat sem criptografia.',
        'Ao trocar qualquer senha, atualize também o GitHub Secret correspondente.',
    ]
    warning_content = [
        Paragraph(line, ParagraphStyle(
            f'warn{i}',
            fontName='Helvetica-Bold' if i == 0 else 'Helvetica',
            fontSize=8.5 if i == 0 else 8,
            textColor=colors.HexColor('#721c24'),
            leading=13,
        )) for i, line in enumerate(warning_lines)
    ]
    warn_tbl = Table(
        [[warning_content]],
        colWidths=[usable_w],
    )
    warn_tbl.setStyle(TableStyle([
        ('BACKGROUND',   (0, 0), (-1, -1), WARNING_BG),
        ('BOX',          (0, 0), (-1, -1), 1,   WARNING_BORDER),
        ('LINELEFT',     (0, 0), (0, -1),  4,   WARNING_BORDER),
        ('TOPPADDING',   (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING',(0, 0), (-1, -1), 8),
        ('LEFTPADDING',  (0, 0), (-1, -1), 12),
        ('RIGHTPADDING', (0, 0), (-1, -1), 12),
    ]))
    story.append(KeepTogether([warn_tbl]))

    # ── Page number callback ──────────────────────────────────────────────────
    def add_page_number(canvas, doc):
        canvas.saveState()
        canvas.setFont('Helvetica', 7)
        canvas.setFillColor(SUBTEXT)
        page_num = canvas.getPageNumber()
        text = f'WMS VerticalParts — Documento Confidencial — Página {page_num}'
        canvas.drawCentredString(page_w / 2, 10 * mm, text)
        # thin line above footer
        canvas.setStrokeColor(BORDER_COLOR)
        canvas.setLineWidth(0.5)
        canvas.line(margin, 14 * mm, page_w - margin, 14 * mm)
        canvas.restoreState()

    # ── Build ────────────────────────────────────────────────────────────────
    doc.build(story, onFirstPage=add_page_number, onLaterPages=add_page_number)
    print(f'PDF gerado com sucesso: {OUTPUT_PATH}')


if __name__ == '__main__':
    build_pdf()
