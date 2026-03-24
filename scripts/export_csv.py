#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
仕様:
- 変体仮名一覧表のテーブルを取得してCSV化する。
- 出力カラム: 平仮名, UNICODE
  - UNICODE はその行内に存在する <code> の inner text を使う（例: "U+1B003"）。
  - <code> が無ければ UNICODE は空欄にする。
- 平仮名列: 各行の 2 番目の <td> (index 1) をタグ除去してそのまま出力
- 3 列目は出力しない。
- 正規化・重複除去は行わない。HTML に書かれている順序を尊重する。
"""
from __future__ import annotations
import re
import sys
import os
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
REMOTE_URL = 'https://cid.ninjal.ac.jp/kana/list/'
OUT_DIR = os.path.join(BASE_DIR, 'out')
OUT_PATH = os.path.join(OUT_DIR, 'mapper.csv')

TABLE_RE = re.compile(r'<table[^>]*>([\s\S]*?)</table>', re.IGNORECASE)
TR_RE = re.compile(r'<tr[^>]*>([\s\S]*?)</tr>', re.IGNORECASE)
TD_RE = re.compile(r'<td[^>]*>([\s\S]*?)</td>', re.IGNORECASE)
CODE_TAG_RE = re.compile(r'<code[^>]*>([\s\S]*?)</code>', re.IGNORECASE)
TAG_RE = re.compile(r'<[^>]+>')

def fetch_html(url: str) -> str:
    req = Request(url, headers={'User-Agent': 'python-urllib/3'})
    try:
        with urlopen(req) as res:
            charset = res.headers.get_content_charset() or 'utf-8'
            return res.read().decode(charset, errors='replace')
    except (HTTPError, URLError) as e:
        raise SystemExit(f'Failed to fetch remote HTML: {e}')

def strip_tags(s: str) -> str:
    return re.sub(r'\s+', ' ', TAG_RE.sub('', s or '')).strip()

def choose_table(html: str) -> str:
    tables = TABLE_RE.findall(html)
    keywords = ('平仮名', '文字', 'UNICODE', '変体仮名')
    for tbl in tables:
        head_segment = tbl[:800]
        if any(k in head_segment for k in keywords):
            return tbl
    return tables[0] if tables else html

def to_csv_rows(table_html: str):
    """
    Produce rows: (平仮名, UNICODE)
    UNICODE: inner text of first <code> found in the row, else empty string.
    """
    rows = []
    for tr_m in TR_RE.finditer(table_html):
        tr_html = tr_m.group(1)
        tds = TD_RE.findall(tr_html)
        if len(tds) < 2:
            continue
        hira = strip_tags(tds[1])
        code_m = CODE_TAG_RE.search(tr_html)
        if code_m:
            unicode_text = strip_tags(code_m.group(1))
        else:
            unicode_text = ''
        rows.append((hira, unicode_text))
    return rows

def esc_csv(s: str) -> str:
    return '"' + (s or '').replace('"', '""') + '"'

def main():
    print('Fetching remote:', REMOTE_URL, file=sys.stderr)
    html = fetch_html(REMOTE_URL)
    table_html = choose_table(html)
    rows = to_csv_rows(table_html)
    os.makedirs(OUT_DIR, exist_ok=True)
    with open(OUT_PATH, 'w', encoding='utf-8', newline='') as f:
        f.write('平仮名,UNICODE\n')
        for hira, uni in rows:
            f.write(','.join([esc_csv(hira), esc_csv(uni)]) + '\n')
    print(f'Wrote {OUT_PATH} with {len(rows)} rows', file=sys.stderr)

if __name__ == '__main__':
    main()