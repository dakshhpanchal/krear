import jinja2
import os
import subprocess
import tempfile
from resumes.tasks import generate_resume, compile_resume_pdf

TEMPLATE_DIR = os.path.join(os.path.dirname(__file__), 'templates', 'latex')

latex_jinja_env = jinja2.Environment(
    block_start_string='\\BLOCK{',
    block_end_string='}',
    variable_start_string='\\VAR{',
    variable_end_string='}',
    comment_start_string='\\#{',
    comment_end_string='}',
    line_statement_prefix='%%',
    line_comment_prefix='%#',
    trim_blocks=True,
    autoescape=False,
    loader=jinja2.FileSystemLoader(TEMPLATE_DIR),
)


def escape_latex(text):
    if not isinstance(text, str):
        return text
    text = text.replace('\\', r'\textbackslash{}')
    replacements = {
        '&': r'\&', '%': r'\%', '$': r'\$', '#': r'\#',
        '_': r'\_', '{': r'\{', '}': r'\}',
        '~': r'\textasciitilde{}', '^': r'\textasciicircum{}',
    }
    for char, replacement in replacements.items():
        text = text.replace(char, replacement)
    return text


latex_jinja_env.filters['escape_latex'] = escape_latex


def render_resume_tex(context: dict) -> str:
    template = latex_jinja_env.get_template('resume.tex.jinja')
    return template.render(**context)

def compile_latex_to_pdf(tex_content: str) -> bytes:
    with tempfile.TemporaryDirectory() as tmpdir:
        tex_path = os.path.join(tmpdir, 'resume.tex')
        pdf_path = os.path.join(tmpdir, 'resume.pdf')
        with open(tex_path, 'w') as f:
            f.write(tex_content)
        result = subprocess.run(
            [
                'tectonic', '-X', 'compile',
                '--outdir', tmpdir, tex_path,
            ],
            capture_output=True,
            text=True,
            timeout=180,
        )
        if result.returncode != 0 or not os.path.exists(pdf_path):
            raise RuntimeError(
                f"LaTeX compilation failed:\n{result.stderr[-2000:]}"
            )
        with open(pdf_path, 'rb') as f:
            return f.read()