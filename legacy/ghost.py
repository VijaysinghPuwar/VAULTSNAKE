"""ghost.py – Snake mini‑game (v3.3)

Changes
=======
• Game now ends if the snake hits a wall or itself.
• HUD and game‑over screen now show the **username** alongside the score.
• Best score table already keyed by username is automatically updated when
  a new personal best is achieved.
"""
from __future__ import annotations

import json, random, tkinter as tk
from pathlib import Path
from typing import Dict, List, Tuple

# ------------------ config -------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent
SCORES   = BASE_DIR / "highscores.json"
CELL, GRID_W, GRID_H, FPS = 20, 30, 20, 90

BG, GRID_CLR = "#0a0a0a", "#111"
HEAD_CLR, BODY_CLR, FOOD_CLR = "#39ff14", "#0b8b00", "#ff4136"
BTN_BG, BTN_FG, BTN_ACTIVE = "#222", "#39ff14", "#555555"

# ------------------ persistence -------------------------------------------

def _load() -> Dict[str,int]:
    try: return json.loads(SCORES.read_text()) if SCORES.exists() else {}
    except Exception: return {}

def _save(d:Dict[str,int]):
    try: SCORES.write_text(json.dumps(d,indent=2))
    except Exception: pass

# ------------------ main class -------------------------------------------

class SnakeGame:
    def __init__(self, user:str):
        self.user=user; self.scores=_load(); self.score=tk.IntVar(value=0); self.game_over=False
        self.root=tk.Toplevel(bg=BG); self.root.title(f"Snake – {user}")
        self.canvas=tk.Canvas(self.root,width=CELL*GRID_W,height=CELL*GRID_H,bg=BG,highlightthickness=0)
        self.canvas.pack()
        self.hud=tk.Label(self.root,fg=HEAD_CLR,bg=BG,font=("Consolas",14)); self.hud.pack(fill=tk.X)
        self.overlay: tk.Frame|None=None
        for k,d in {"<Up>":(0,-1),"<Down>":(0,1),"<Left>":(-1,0),"<Right>":(1,0)}.items():
            self.root.bind(k,lambda e,dir=d:self._turn(*dir))
        self._reset()

    # ---------- helpers ---------------------------------------------------
    def _btn(self,txt,cmd):
        return tk.Button(self.overlay,text=txt,command=cmd,bg=BTN_BG,fg=BTN_FG,activebackground=BTN_ACTIVE,font=("Consolas",14),bd=0,padx=20,pady=5)
    def _grid(self):
        for x in range(0,GRID_W*CELL,CELL): self.canvas.create_line(x,0,x,GRID_H*CELL,fill=GRID_CLR)
        for y in range(0,GRID_H*CELL,CELL): self.canvas.create_line(0,y,GRID_W*CELL,y,fill=GRID_CLR)
    def _sq(self,x,y,c): self.canvas.create_rectangle(x*CELL,y*CELL,(x+1)*CELL,(y+1)*CELL,fill=c,outline="")

    # ---------- lifecycle -------------------------------------------------
    def _reset(self):
        if self.overlay: self.overlay.destroy(); self.overlay=None
        self.dir=(1,0); self.snake=[(GRID_W//2,GRID_H//2)]; self.food=self._food(); self.score.set(0); self.game_over=False
        self._draw(); self._tick()
    def _food(self):
        while True:
            p=(random.randrange(GRID_W),random.randrange(GRID_H))
            if p not in self.snake: return p

    # ---------- drawing ---------------------------------------------------
    def _draw(self):
        self.canvas.delete("all"); self._grid(); self._sq(*self.food,FOOD_CLR)
        for i,(x,y) in enumerate(self.snake): self._sq(x,y, HEAD_CLR if i==0 else BODY_CLR)
        best=self.scores.get(self.user,0)
        self.hud.config(text=f"{self.user} Score: {self.score.get()}    Best: {best}")

    # ---------- movement & tick ------------------------------------------
    def _turn(self,dx,dy):
        if (dx,dy)==(-self.dir[0],-self.dir[1]): return
        self.dir=(dx,dy)

    def _tick(self):
        if self.game_over: return
        hx,hy=self.snake[0]
        nx,ny=hx+self.dir[0],hy+self.dir[1]
        # Game over on wall collision or self-collision
        if nx<0 or nx>=GRID_W or ny<0 or ny>=GRID_H or (nx,ny) in self.snake:
            return self._end()
        self.snake.insert(0,(nx,ny))
        if (nx,ny)==self.food:
            self.score.set(self.score.get()+1); self.food=self._food()
        else:
            self.snake.pop()
        self._draw(); self.root.after(FPS,self._tick)

    # ---------- game over & leaderboard ----------------------------------
    def _end(self):
        self.game_over=True
        if self.score.get()>self.scores.get(self.user,0):
            self.scores[self.user]=self.score.get(); _save(self.scores)
        self._show_game_over()

    def _show_game_over(self):
        self.overlay=tk.Frame(self.root,bg="",highlightthickness=0)
        self.overlay.place(relx=0.5,rely=0.5,anchor="center")
        sc,best=self.score.get(),self.scores.get(self.user,0)
        tk.Label(self.overlay,text="GAME OVER",fg="#ff3333",bg=BG,font=("Consolas",24,"bold")).pack(pady=(0,10))
        tk.Label(self.overlay,text=f"{self.user} Score: {sc}   (Best: {best})",fg=BTN_FG,bg=BG,font=("Consolas",14)).pack(pady=(0,15))
        self._btn("Retry",self._reset).pack()
        self._btn("Leaderboard",self._leaderboard).pack(pady=(10,0))

    def _leaderboard(self):
        win=tk.Toplevel(self.root,bg=BG); win.title("Leaderboard")
        tk.Label(win,text="Top Scores",fg=HEAD_CLR,bg=BG,font=("Consolas",18,"bold")).pack(pady=10)
        for i,(u,s) in enumerate(sorted(self.scores.items(), key=lambda kv: kv[1], reverse=True),1):
            clr=HEAD_CLR if u==self.user else "white"
            tk.Label(win,text=f"{i:>2}. {u:<20} {s}",fg=clr,bg=BG,font=("Consolas",12)).pack(anchor="w",padx=20)
        tk.Button(win,text="Close",command=win.destroy,bg=BTN_BG,fg=BTN_FG,activebackground=BTN_ACTIVE).pack(pady=10)

# ---------------- entry ---------------------------------------------------

def main(username:str):
    SnakeGame(username)

if __name__=="__main__":
    main("demo")
