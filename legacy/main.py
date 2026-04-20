from __future__ import annotations

import importlib
import json
import random
import string
from pathlib import Path
from typing import Dict, Any

import tkinter as tk
from tkinter import messagebox, scrolledtext
from cryptography.fernet import Fernet

# ------------------------------ config ------------------------------------
BASE_DIR = Path(__file__).resolve().parent
CRED_FILE = BASE_DIR / "credentials.enc"
CODE_FILE = BASE_DIR / "ghost.py"
KEY_FILE = BASE_DIR / "secret.key"

def _load_or_create_key() -> bytes:
    if KEY_FILE.exists():
        return KEY_FILE.read_bytes()
    key = Fernet.generate_key()
    KEY_FILE.write_bytes(key)
    return key

FERNET_KEY = _load_or_create_key()
FERNET = Fernet(FERNET_KEY)

FONT = ("Consolas", 14)
GREEN = "#00FF00"


# ------------------------------ helpers -----------------------------------

def enc(data: bytes) -> bytes:    return FERNET.encrypt(data)

def dec(data: bytes) -> bytes:    return FERNET.decrypt(data)

def read_json(path: Path, default: Dict[str, Any] | None = None):
    try: return json.loads(dec(path.read_bytes()).decode()) if path.exists() else default or {}
    except Exception: return default or {}

def write_json(path: Path, obj: Dict[str, Any]):
    try: path.write_bytes(enc(json.dumps(obj).encode()))
    except Exception: messagebox.showerror("Disk Error", "Could not write credentials file.")


class MatrixLoginApp:
    CHARS = string.ascii_letters + string.digits
    FONT_SIZE = 14

    def __init__(self):
        self.user: str | None = None
        self.is_admin = False
        self._viewer_btn: tk.Button | None = None

        self.root = tk.Tk()
        self.root.title("Matrix Login – Encrypted Admin / User")
        self.root.geometry("800x600")
        self.root.configure(bg="black")

        # matrix background ------------------------------------------------
        self.canvas = tk.Canvas(self.root, bg="black", highlightthickness=0)
        self.canvas.place(relwidth=1, relheight=1)
        line_h = self.FONT_SIZE + 4
        rows = int(self.root.winfo_screenheight() / line_h)
        self.matrix_items = [
            self.canvas.create_text(10, i*line_h, anchor="nw",
                                     text=self._rand_line(), font=("Courier", self.FONT_SIZE), fill=GREEN)
            for i in range(rows)
        ]
        self._animate()

        # UI --------------------------------------------------------------
        self._build_ui()
        self.root.mainloop()

    # --------------------- UI builders ----------------------------------
    def _label(self, parent, text, **opts):
        return tk.Label(parent, text=text, bg="black", fg="white", **opts)

    def _button(self, parent, text, cmd):
        return tk.Button(parent, text=text, command=cmd, bg="black", fg=GREEN, activebackground="green")

    def _build_ui(self):
        frame = tk.Frame(self.root, bg="black"); frame.place(relx=0.5, rely=0.5, anchor="center")

        self._label(frame, "Username:").pack(pady=(10,0))
        self.ent_user = tk.Entry(frame); self.ent_user.pack()
        self._label(frame, "Password:").pack(pady=(10,0))
        self.ent_pass = tk.Entry(frame, show="*"); self.ent_pass.pack()

        self._button(frame, "Sign Up", self.signup).pack(pady=5)
        self._button(frame, "Login", self.login).pack(pady=5)
        self.status = self._label(frame, "", font=("Arial", 14)); self.status.pack(pady=10)

    # --------------------- matrix animation -----------------------------
    def _rand_line(self):
        return "".join(random.choices(self.CHARS, k=80))

    def _animate(self):
        for item in self.matrix_items:
            self.canvas.itemconfig(item, text=self._rand_line())
        self.root.after(100, self._animate)

    # --------------------- credential I/O --------------------------------
    @staticmethod
    def _cred_dict() -> Dict[str, Dict[str, Any]]:
        return read_json(CRED_FILE)

    # --------------------- sign-up / login ------------------------------
    def signup(self):
        user, pw = self.ent_user.get().strip(), self.ent_pass.get().strip()
        if not user or not pw: return messagebox.showerror("Error", "Username and password required.")
        creds = self._cred_dict()
        if not creds:  # first user → admin
            creds[user] = {"password": pw, "is_admin": True}
            write_json(CRED_FILE, creds)
            return messagebox.showinfo("Success", f"Admin account created for {user}!")
        if not self.is_admin: return messagebox.showerror("Denied", "Only admin can add users.")
        if user in creds: return messagebox.showwarning("Exists", "Username already taken.")
        creds[user] = {"password": pw, "is_admin": False}
        write_json(CRED_FILE, creds)
        messagebox.showinfo("Success", f"User '{user}' created.")

    def login(self):
        user, pw = self.ent_user.get().strip(), self.ent_pass.get().strip()
        creds = self._cred_dict()
        if user in creds and creds[user]["password"] == pw:
            self.user, self.is_admin = user, bool(creds[user]["is_admin"])
            messagebox.showinfo("Login", f"Welcome {user}!")
            self.status.config(text="Login Successful")
            self._launch_game()
        else:
            self.status.config(text="Login Failed"); messagebox.showerror("Error", "Bad credentials.")

    # --------------------- launch game & code viewer --------------------
    def _launch_game(self):
        try:
            ghost = importlib.import_module("ghost")
            ghost.main(username=self.user)
            self._add_viewer_btn()
        except Exception as exc:
            messagebox.showerror("Ghost Error", str(exc))

    def _add_viewer_btn(self):
        if self._viewer_btn is not None:  # already present
            return
        self._viewer_btn = tk.Button(self.root, text="View Snake Source", command=self._show_code,
                                      bg="black", fg=GREEN, activebackground="green")
        self._viewer_btn.place(relx=1, rely=1, anchor="se", x=-10, y=-10)

    def _show_code(self):
        if not CODE_FILE.exists():
            return messagebox.showerror("Missing", "ghost.py not found")
        win = tk.Toplevel(self.root, bg="black"); win.title("ghost.py")
        code = CODE_FILE.read_text(encoding="utf-8")
        st = scrolledtext.ScrolledText(win, wrap=tk.NONE, bg="#111", fg="#0f0", insertbackground="#0f0")
        st.insert(tk.END, code); st.config(state=tk.DISABLED); st.pack(fill=tk.BOTH, expand=True)


if __name__ == "__main__":
    MatrixLoginApp()
