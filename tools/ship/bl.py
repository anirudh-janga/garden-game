"""Backlog helper.
  bl.py row "<markdown table row>"   add a row to the status table (above the legend)
  bl.py status "<text>"              replace the "Current stories" line
  bl.py log "<entry>"                add an entry at the top of the feedback log
"""
import sys, re
import os
p = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'BACKLOG.md')
s = open(p).read()
cmd, text = sys.argv[1], sys.argv[2]
if cmd == 'row':
    anchor = '\n\nStatus legend:'
    assert anchor in s
    s = s.replace(anchor, '\n' + text + anchor, 1)
elif cmd == 'status':
    s = re.sub(r"\*\*Current stories:\*\*.*?\n", "**Current stories:** " + text + "\n", s, count=1)
elif cmd == 'log':
    a = "_Feedback from each review, newest first, and what we changed because of it._\n\n"
    s = s.replace(a, a + text + "\n", 1)
open(p, 'w').write(s)
