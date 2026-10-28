"""Minimal black-and-white SVG charts in the kuldeep.cc house style (1200x675)."""
from xml.sax.saxutils import escape as E
W,H=1200,675
FONT="Inter, 'Helvetica Neue', Arial, sans-serif"
INK="#0a0a0a"; MUTED="#737373"; FAINT="#a3a3a3"; RULE="#e5e5e5"; ACC="#0a0a0a"; SEC="#bdbdbd"

def frame(title,sub,source,body,h=H):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {h}" width="{W}" height="{h}" font-family="{FONT}">
<rect width="{W}" height="{h}" fill="#ffffff"/>
<text x="56" y="70" font-size="34" font-weight="700" fill="{INK}" letter-spacing="-0.6">{E(title)}</text>
<text x="56" y="108" font-size="20" fill="{MUTED}">{E(sub)}</text>
{body}
<line x1="56" x2="{W-56}" y1="{h-50}" y2="{h-50}" stroke="{RULE}"/>
<text x="56" y="{h-22}" font-size="15" fill="{MUTED}">{E(source)}</text>
<text x="{W-56}" y="{h-22}" font-size="15" font-weight="700" fill="{INK}" text-anchor="end">kuldeep.cc/data</text>
</svg>'''

def hbar(title,sub,source,items,fmt=lambda v:f"{v}%",highlight=None,maxv=None,label_w=300,h=None,note=None):
    n=len(items); h=h or max(H,170+n*44+70)
    top=150; rowh=(h-top-90)/n; x0=56+label_w; x1=W-130
    mx=maxv or max(v for _,v in items)
    out=[]
    for i,(lab,v) in enumerate(items):
        y=top+i*rowh; bh=min(26,rowh*0.62); cy=y+rowh/2
        col=ACC if (highlight is None or lab in highlight) else SEC
        w=(x1-x0)*v/mx
        out.append(f'<text x="{x0-14}" y="{cy+6}" font-size="19" fill="{INK}" text-anchor="end">{E(lab)}</text>')
        out.append(f'<rect x="{x0}" y="{cy-bh/2}" width="{x1-x0}" height="{bh}" fill="#f4f4f4"/>')
        out.append(f'<rect x="{x0}" y="{cy-bh/2}" width="{max(w,1.5)}" height="{bh}" fill="{col}"/>')
        out.append(f'<text x="{x0+w+10}" y="{cy+6}" font-size="18" font-weight="700" fill="{INK}">{E(fmt(v))}</text>')
    if note: out.append(f'<text x="{x0}" y="{h-66}" font-size="15" fill="{MUTED}">{E(note)}</text>')
    return frame(title,sub,source,"\n".join(out),h)

def grouped_hbar(title,sub,source,groups,series,fmt=lambda v:f"{v}%",maxv=None,label_w=200):
    # groups: [(label,[v1,v2,v3])], series: [(name,color)]
    n=len(groups); k=len(series); top=180; rowh=(H-top-80)/n; x0=56+label_w; x1=W-120
    mx=maxv or max(v for _,vs in groups for v in vs if v is not None)
    out=[]
    lx=56
    for name,col in series:
        out.append(f'<rect x="{lx}" y="136" width="16" height="16" fill="{col}"/><text x="{lx+24}" y="150" font-size="17" fill="{INK}">{E(name)}</text>')
        lx+=24+len(name)*9.6+36
    for i,(lab,vs) in enumerate(groups):
        y=top+i*rowh; bh=min(18,(rowh-14)/k)
        out.append(f'<text x="{x0-14}" y="{y+rowh/2+6}" font-size="19" font-weight="700" fill="{INK}" text-anchor="end">{E(lab)}</text>')
        for j,v in enumerate(vs):
            yy=y+(rowh-k*bh-(k-1)*4)/2+j*(bh+4)
            if v is None:
                out.append(f'<text x="{x0+4}" y="{yy+bh-3}" font-size="14" fill="{FAINT}">no such bot</text>'); continue
            w=(x1-x0)*v/mx
            out.append(f'<rect x="{x0}" y="{yy}" width="{max(w,1.5)}" height="{bh}" fill="{series[j][1]}"/>')
            out.append(f'<text x="{x0+w+8}" y="{yy+bh-3}" font-size="15" fill="{INK}">{E(fmt(v))}</text>')
    return frame(title,sub,source,"\n".join(out))

def vbar(title,sub,source,items,fmt=lambda v:f"{v}",highlight=None,maxv=None,ylab=None):
    n=len(items); x0=90; x1=W-56; top=160; bot=H-120
    mx=maxv or max(v for _,v in items)
    bw=(x1-x0)/n; out=[]
    for t in range(0,5):
        yv=mx*t/4; y=bot-(bot-top)*t/4
        out.append(f'<line x1="{x0}" x2="{x1}" y1="{y}" y2="{y}" stroke="{RULE}"/>')
    for i,(lab,v) in enumerate(items):
        h_=(bot-top)*v/mx; x=x0+i*bw+bw*0.18
        col=ACC if (highlight is None or lab in highlight) else SEC
        out.append(f'<rect x="{x}" y="{bot-h_}" width="{bw*0.64}" height="{h_}" fill="{col}"/>')
        out.append(f'<text x="{x+bw*0.32}" y="{bot-h_-10}" font-size="18" font-weight="700" fill="{INK}" text-anchor="middle">{E(fmt(v))}</text>')
        out.append(f'<text x="{x+bw*0.32}" y="{bot+28}" font-size="17" fill="{INK}" text-anchor="middle">{E(lab)}</text>')
    if ylab: out.append(f'<text x="{x0}" y="{top-18}" font-size="15" fill="{MUTED}">{E(ylab)}</text>')
    return frame(title,sub,source,"\n".join(out))

def lines(title,sub,source,series,xlabels,fmt=lambda v:f"{v}",maxv=None,minv=0,ylab=None,annot=None,step=False):
    # series: [(name,color,dash,[values or None])]
    x0=100; x1=W-170; top=160; bot=H-120; n=len(xlabels)
    vals=[v for _,_,_,vs in series for v in vs if v is not None]
    mx=maxv or max(vals)*1.12; out=[]
    X=lambda i: x0+(x1-x0)*i/(n-1); Y=lambda v: bot-(bot-top)*(v-minv)/(mx-minv)
    for t in range(0,5):
        v=minv+(mx-minv)*t/4; y=Y(v)
        out.append(f'<line x1="{x0}" x2="{x1}" y1="{y}" y2="{y}" stroke="{RULE}"/><text x="{x0-12}" y="{y+5}" font-size="15" fill="{MUTED}" text-anchor="end">{E(fmt(round(v,2)))}</text>')
    for i,l in enumerate(xlabels):
        if l: out.append(f'<text x="{X(i)}" y="{bot+30}" font-size="16" fill="{INK}" text-anchor="middle">{E(l)}</text>')
    for name,col,dash,vs in series:
        pts=[(X(i),Y(v)) for i,v in enumerate(vs) if v is not None]
        if step:
            d=f"M{pts[0][0]},{pts[0][1]}"+"".join(f" H{x} V{y}" for x,y in pts[1:])
        else:
            d="M"+" L".join(f"{x},{y}" for x,y in pts)
        out.append(f'<path d="{d}" fill="none" stroke="{col}" stroke-width="4" {"stroke-dasharray=%s"%chr(34)+dash+chr(34) if dash else ""} stroke-linejoin="round"/>')
        for x,y in pts: out.append(f'<circle cx="{x}" cy="{y}" r="6" fill="#fff" stroke="{col}" stroke-width="3"/>')
        lx,ly=pts[-1]; lv=[v for v in vs if v is not None][-1]
        out.append(f'<text x="{lx+14}" y="{ly+6}" font-size="17" font-weight="700" fill="{col}">{E(name)} {E(fmt(lv))}</text>')
    for (i,v,txt) in (annot or []):
        out.append(f'<text x="{X(i)}" y="{Y(v)-16}" font-size="15" fill="{MUTED}" text-anchor="middle">{E(txt)}</text>')
    if ylab: out.append(f'<text x="{x0}" y="{top-20}" font-size="15" fill="{MUTED}">{E(ylab)}</text>')
    return frame(title,sub,source,"\n".join(out))

def stack(title,sub,source,parts,total_label=None):
    # single 100% stacked bar with labelled segments: parts [(label,value,color)]
    x0=56; x1=W-56; y=230; bh=70; tot=sum(v for _,v,_ in parts); out=[]; x=x0
    for i,(lab,v,col) in enumerate(parts):
        w=(x1-x0)*v/tot
        out.append(f'<rect x="{x}" y="{y}" width="{w}" height="{bh}" fill="{col}" stroke="#fff" stroke-width="2"/>')
        x+=w
    out.append(f'<rect x="{x0}" y="{y}" width="{x1-x0}" height="{bh}" fill="none" stroke="{INK}" stroke-width="1.5"/>')
    # legend rows
    ly=350
    for i,(lab,v,col) in enumerate(parts):
        out.append(f'<rect x="{x0}" y="{ly+i*40-15}" width="18" height="18" fill="{col}" stroke="{INK}" stroke-width="{1 if col=="#ffffff" else 0}"/>')
        out.append(f'<text x="{x0+30}" y="{ly+i*40}" font-size="19" fill="{INK}">{E(lab)}</text>')
        out.append(f'<text x="{x1}" y="{ly+i*40}" font-size="19" font-weight="700" fill="{INK}" text-anchor="end">{v:,} sites · {100*v/tot:.1f}%</text>')
    return frame(title,sub,source,"\n".join(out),h=max(H,ly+len(parts)*40+60))
