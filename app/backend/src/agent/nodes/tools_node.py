"""Tools Node — thin wrapper around LangGraph's prebuilt ToolNode.

We keep a module-level export so graph.py can import it alongside the other
node functions without constructing anything at import time of graph.py.
"""
from __future__ import annotations

from langgraph.prebuilt import ToolNode

from ..tools import ALL_TOOLS

tools_node = ToolNode(ALL_TOOLS)
