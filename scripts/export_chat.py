import json
import re
import html
from pathlib import Path

def export_conversation():
    transcript_path = Path(r"C:\Users\MSI\.gemini\antigravity\brain\12d9a574-778c-4176-9fc1-82c4df77024c\.system_generated\logs\transcript.jsonl")
    export_dir = Path("exports")
    export_dir.mkdir(parents=True, exist_ok=True)

    turns = []
    current_turn = None

    if not transcript_path.exists():
        print(f"Error: {transcript_path} does not exist.")
        return

    with open(transcript_path, "r", encoding="utf-8") as f:
        for line in f:
            if not line.strip():
                continue
            data = json.loads(line)
            step_type = data.get("type")
            content = data.get("content")
            created_at = data.get("created_at", "")

            if step_type == "USER_INPUT" and content:
                clean_text = content
                if "<USER_REQUEST>" in clean_text:
                    m = re.search(r"<USER_REQUEST>(.*?)</USER_REQUEST>", clean_text, re.DOTALL)
                    if m:
                        clean_text = m.group(1).strip()
                if "<CONTEXT_SUMMARY>" in clean_text:
                    clean_text = clean_text.split("</CONTEXT_SUMMARY>")[-1].strip()
                    if "<USER_REQUEST>" in clean_text:
                        m = re.search(r"<USER_REQUEST>(.*?)</USER_REQUEST>", clean_text, re.DOTALL)
                        if m:
                            clean_text = m.group(1).strip()
                
                # Check for system messages inside user input
                if clean_text.startswith("<SYSTEM_MESSAGE>"):
                    continue

                current_turn = {
                    "turn_index": len(turns) + 1,
                    "user_text": clean_text,
                    "created_at": created_at,
                    "assistant_text": ""
                }
                turns.append(current_turn)

            elif step_type == "PLANNER_RESPONSE" and content:
                if current_turn is not None and content.strip():
                    # We keep the latest or append assistant response for this turn
                    if current_turn["assistant_text"]:
                        current_turn["assistant_text"] += "\n\n" + content.strip()
                    else:
                        current_turn["assistant_text"] = content.strip()

    # 1. Generate Markdown export
    md_lines = [
        "# Phiên Trò Chuyện: Việt Phục Remix - AI Asset Pipeline & Digital Atelier",
        "",
        "- **Conversation ID:** `12d9a574-778c-4176-9fc1-82c4df77024c`",
        "- **Thời gian khởi tạo:** 09/10/2026 - 10/10/2026",
        f"- **Tổng số lượt trao đổi (Turns):** {len(turns)}",
        "",
        "---",
        ""
    ]

    for t in turns:
        idx = t["turn_index"]
        ts = t["created_at"]
        md_lines.append(f"## 👤 Lượt {idx} - Người dùng ({ts})")
        md_lines.append("")
        md_lines.append(t["user_text"])
        md_lines.append("")
        if t["assistant_text"]:
            md_lines.append(f"## 🤖 Antigravity AI ({ts})")
            md_lines.append("")
            md_lines.append(t["assistant_text"])
            md_lines.append("")
        md_lines.append("---")
        md_lines.append("")

    md_output_path = export_dir / "chat_export.md"
    with open(md_output_path, "w", encoding="utf-8") as f:
        f.write("\n".join(md_lines))
    print(f"Exported Markdown to: {md_output_path.resolve()}")

    # 2. Generate Interactive Standalone HTML Viewer
    turns_json = json.dumps(turns, ensure_ascii=False)

    html_content = f"""<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Phiên Trò Chuyện: Việt Phục Remix (AI Arena)</title>
  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
  <style>
    body {{
      background-color: #09090b;
      color: #f4f4f5;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    }}
    .prose pre {{
      background: #18181b !important;
      border: 1px solid #27272a;
      border-radius: 0.75rem;
      padding: 1rem;
    }}
    .prose code {{
      color: #fbbf24;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }}
    .prose a {{
      color: #38bdf8;
      text-decoration: underline;
    }}
    .prose table {{
      width: 100%;
      border-collapse: collapse;
      margin: 1rem 0;
    }}
    .prose th, .prose td {{
      border: 1px solid #27272a;
      padding: 0.5rem 0.75rem;
      text-align: left;
    }}
    .prose th {{
      background-color: #18181b;
      color: #e4e4e7;
    }}
    .prose img {{
      max-width: 100%;
      border-radius: 0.5rem;
      margin: 0.5rem 0;
    }}
  </style>
</head>
<body class="min-h-screen flex flex-col">

  <!-- Header -->
  <header class="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-zinc-800 px-6 py-4">
    <div class="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <div class="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
        <div>
          <h1 class="text-base font-bold tracking-wider uppercase text-zinc-100">
            Việt Phục Remix · Chat Session Export
          </h1>
          <p class="text-xs text-zinc-400 font-mono">
            Conversation ID: 12d9a574-778c-4176-9fc1-82c4df77024c
          </p>
        </div>
      </div>
      <div class="flex items-center gap-3 text-xs font-mono">
        <span class="px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300">
          Tổng số lượt: <strong id="totalTurns">{len(turns)}</strong>
        </span>
        <button onclick="window.print()" class="px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition">
          In / Lưu PDF
        </button>
      </div>
    </div>
  </header>

  <!-- Search & Filter Bar -->
  <div class="max-w-5xl w-full mx-auto px-6 pt-6">
    <div class="relative">
      <input
        type="text"
        id="searchInput"
        placeholder="Tìm kiếm nội dung cuộc trò chuyện..."
        class="w-full px-4 py-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
      />
    </div>
  </div>

  <!-- Messages List -->
  <main id="chatContainer" class="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 space-y-8">
    <!-- Messages will be rendered here by JavaScript -->
  </main>

  <footer class="border-t border-zinc-900 bg-black py-6 text-center text-xs text-zinc-500 font-mono">
    Antigravity AI Coding Assistant · Local Transcript Exporter
  </footer>

  <script>
    const turns = {turns_json};

    function renderChat(filteredTurns) {{
      const container = document.getElementById('chatContainer');
      container.innerHTML = '';

      if (filteredTurns.length === 0) {{
        container.innerHTML = '<div class="text-center py-12 text-zinc-500">Không tìm thấy nội dung phù hợp.</div>';
        return;
      }}

      filteredTurns.forEach(t => {{
        // Turn Wrapper
        const turnDiv = document.createElement('div');
        turnDiv.className = 'space-y-4 p-5 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 shadow-lg';

        // Turn Header
        const header = document.createElement('div');
        header.className = 'flex items-center justify-between text-xs font-mono text-zinc-400 border-b border-zinc-800/60 pb-2.5';
        header.innerHTML = `<span>Lượt trao đổi #${{t.turn_index}}</span><span>${{t.created_at || ''}}</span>`;
        turnDiv.appendChild(header);

        // User Message
        const userDiv = document.createElement('div');
        userDiv.className = 'flex items-start gap-3.5';
        userDiv.innerHTML = `
          <div class="w-8 h-8 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-xs shrink-0">
            U
          </div>
          <div class="flex-1 bg-zinc-900/90 border border-zinc-800 p-4 rounded-xl text-zinc-200 text-sm leading-relaxed whitespace-pre-wrap font-sans">
            ${{t.user_text}}
          </div>
        `;
        turnDiv.appendChild(userDiv);

        // Assistant Message
        if (t.assistant_text) {{
          const asstDiv = document.createElement('div');
          asstDiv.className = 'flex items-start gap-3.5';
          asstDiv.innerHTML = `
            <div class="w-8 h-8 rounded-full bg-amber-600/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-xs shrink-0">
              AI
            </div>
            <div class="flex-1 bg-zinc-900/40 border border-zinc-800/60 p-4 rounded-xl text-zinc-200 text-sm leading-relaxed prose prose-invert max-w-none">
              ${{marked.parse(t.assistant_text)}}
            </div>
          `;
          turnDiv.appendChild(asstDiv);
        }}

        container.appendChild(turnDiv);
      }});

      // Trigger highlight.js on code blocks
      document.querySelectorAll('pre code').forEach((el) => {{
        hljs.highlightElement(el);
      }});
    }}

    renderChat(turns);

    // Search event
    document.getElementById('searchInput').addEventListener('input', (e) => {{
      const query = e.target.value.toLowerCase().trim();
      if (!query) {{
        renderChat(turns);
      }} else {{
        const filtered = turns.filter(t => 
          (t.user_text && t.user_text.toLowerCase().includes(query)) ||
          (t.assistant_text && t.assistant_text.toLowerCase().includes(query))
        );
        renderChat(filtered);
      }}
    }});
  </script>
</body>
</html>
"""

    html_output_path = export_dir / "chat_share.html"
    with open(html_output_path, "w", encoding="utf-8") as f:
        f.write(html_content)
    print(f"Exported HTML to: {html_output_path.resolve()}")

if __name__ == "__main__":
    export_conversation()
