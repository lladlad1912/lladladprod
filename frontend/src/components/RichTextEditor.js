import React, { useEffect, useRef, useState } from 'react';

// Simple in-house rich text editor (no Quill / no external editor library).
// Uses contentEditable + document.execCommand for basic formatting.
// Stores/returns HTML.
export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Write here...',
  onUploadImage,
}) {
  const editorRef = useRef(null);
  const lastHtmlRef = useRef(value || '');
  const selectionRef = useRef(null);
  const fileInputRef = useRef(null);
  const rafRef = useRef(null);

  const [toolbarState, setToolbarState] = useState({
    bold: false,
    italic: false,
    underline: false,
    strike: false,
    ul: false,
    ol: false,
    link: false,
    block: 'P',
    fontSize: '14',
  });

  const getSelectionRange = () => {
    const sel = window.getSelection?.();
    if (!sel || sel.rangeCount === 0) return null;
    return sel.getRangeAt(0);
  };

  const saveSelectionIfInsideEditor = () => {
    const editorEl = editorRef.current;
    const range = getSelectionRange();
    if (!editorEl || !range) return;
    const { startContainer, endContainer } = range;
    if (editorEl.contains(startContainer) && editorEl.contains(endContainer)) {
      selectionRef.current = range;
    }
  };

  const isSelectionInsideEditor = () => {
    const editorEl = editorRef.current;
    const range = getSelectionRange();
    if (!editorEl || !range) return false;
    return editorEl.contains(range.startContainer) && editorEl.contains(range.endContainer);
  };

  const isSelectionInsideLink = () => {
    const editorEl = editorRef.current;
    const range = getSelectionRange();
    if (!editorEl || !range) return false;
    let node = range.commonAncestorContainer;
    if (node && node.nodeType === Node.TEXT_NODE) node = node.parentNode;
    while (node && node !== editorEl) {
      if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'A') return true;
      node = node.parentNode;
    }
    return false;
  };

  const normalizeFormatBlock = (val) => {
    if (!val) return 'P';
    const s = String(val).replace(/[<>]/g, '').trim();
    return s ? s.toUpperCase() : 'P';
  };

  const mapQueryFontSizeToPx = (val) => {
    const v = String(val || '').trim();
    // Browser typically returns "1".."7"
    switch (v) {
      case '1': return '10';
      case '2': return '12';
      case '3': return '14';
      case '4': return '16';
      case '5': return '18';
      case '6': return '24';
      case '7': return '36';
      default: return '14';
    }
  };

  const refreshToolbarState = () => {
    if (!isSelectionInsideEditor()) return;
    try {
      const next = {
        bold: !!document.queryCommandState('bold'),
        italic: !!document.queryCommandState('italic'),
        underline: !!document.queryCommandState('underline'),
        strike: !!document.queryCommandState('strikeThrough'),
        ul: !!document.queryCommandState('insertUnorderedList'),
        ol: !!document.queryCommandState('insertOrderedList'),
        link: isSelectionInsideLink(),
        block: normalizeFormatBlock(document.queryCommandValue('formatBlock')),
        fontSize: mapQueryFontSizeToPx(document.queryCommandValue('fontSize')),
      };
      setToolbarState((prev) => {
        // avoid re-render spam
        const same =
          prev.bold === next.bold &&
          prev.italic === next.italic &&
          prev.underline === next.underline &&
          prev.strike === next.strike &&
          prev.ul === next.ul &&
          prev.ol === next.ol &&
          prev.link === next.link &&
          prev.block === next.block &&
          prev.fontSize === next.fontSize;
        return same ? prev : next;
      });
    } catch {
      // ignore
    }
  };

  const scheduleRefresh = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      refreshToolbarState();
    });
  };

  const restoreSelection = () => {
    const editorEl = editorRef.current;
    const range = selectionRef.current;
    if (!editorEl || !range) return;
    const sel = window.getSelection?.();
    if (!sel) return;
    sel.removeAllRanges();
    sel.addRange(range);
  };

  const emitHtmlIfChanged = () => {
    const editorEl = editorRef.current;
    if (!editorEl) return;
    const html = editorEl.innerHTML;
    if (html !== lastHtmlRef.current) {
      lastHtmlRef.current = html;
      onChange?.(html);
    }
  };

  // Keep DOM in sync when value is changed externally (edit mode load, reset, etc.)
  useEffect(() => {
    const editorEl = editorRef.current;
    const next = value || '';
    lastHtmlRef.current = next;
    if (!editorEl) return;

    // Don't stomp user typing; only sync when editor isn't focused.
    if (document.activeElement === editorEl) return;
    if (editorEl.innerHTML !== next) {
      editorEl.innerHTML = next;
    }
  }, [value]);

  // Track selection so toolbar clicks can restore it (toolbar steals focus).
  useEffect(() => {
    const handler = () => saveSelectionIfInsideEditor();
    document.addEventListener('selectionchange', handler);
    return () => document.removeEventListener('selectionchange', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep toolbar active-state in sync with selection changes.
  useEffect(() => {
    const handler = () => {
      saveSelectionIfInsideEditor();
      scheduleRefresh();
    };
    document.addEventListener('selectionchange', handler);
    return () => document.removeEventListener('selectionchange', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const focusEditor = () => {
    const editorEl = editorRef.current;
    if (!editorEl) return;
    editorEl.focus();
    restoreSelection();
  };

  const exec = (command, commandValue) => {
    focusEditor();
    // eslint-disable-next-line no-restricted-globals
    document.execCommand(command, false, commandValue);
    emitHtmlIfChanged();
    scheduleRefresh();
  };

  const applyBlock = (block) => {
    // execCommand expects tags like 'P', 'H1', 'BLOCKQUOTE', 'PRE'
    exec('formatBlock', block);
  };

  const applyFontSize = (sizePx) => {
    // execCommand fontSize supports 1..7. We map to approximate sizes.
    const px = Number(sizePx);
    let size = '3';
    if (px <= 10) size = '2';
    else if (px <= 12) size = '3';
    else if (px <= 16) size = '4';
    else if (px <= 20) size = '5';
    else if (px <= 28) size = '6';
    else size = '7';
    exec('fontSize', size);
  };

  const insertLink = () => {
    focusEditor();
    const url = window.prompt('Enter URL (https://...)');
    if (!url) return;

    const range = getSelectionRange();
    const isCollapsed = !range || range.collapsed;
    if (isCollapsed) {
      // Insert link text if nothing selected.
      exec(
        'insertHTML',
        `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`
      );
      return;
    }
    exec('createLink', url);
  };

  const insertImage = async (file) => {
    if (!file) return;
    if (!onUploadImage) return;
    try {
      focusEditor();
      const url = await onUploadImage(file);
      if (!url) return;
      exec('insertImage', url);
    } catch (e) {
      // Let parent show an error if desired.
      // eslint-disable-next-line no-console
      console.error('Image upload failed', e);
    }
  };

  const onToolbarMouseDown = (e) => {
    // Prevent editor blur (keeps selection range available),
    // but DO NOT block native <select> dropdown interaction.
    const tag = e.target?.tagName;
    if (tag === 'SELECT' || tag === 'OPTION') {
      return;
    }
    e.preventDefault();
    saveSelectionIfInsideEditor();
  };

  return (
    <div className="rte">
      <div className="rte-toolbar" onMouseDown={onToolbarMouseDown}>
        <select
          className="rte-select"
          value={toolbarState.block}
          onChange={(e) => applyBlock(e.target.value)}
        >
          <option value="P">Normal</option>
          <option value="H1">Heading 1</option>
          <option value="H2">Heading 2</option>
          <option value="H3">Heading 3</option>
          <option value="BLOCKQUOTE">Quote</option>
          <option value="PRE">Code</option>
        </select>

        <select className="rte-select" value={toolbarState.fontSize} onChange={(e) => applyFontSize(e.target.value)}>
          <option value="12">12</option>
          <option value="14">14</option>
          <option value="16">16</option>
          <option value="18">18</option>
          <option value="24">24</option>
          <option value="30">30</option>
          <option value="36">36</option>
        </select>

        <button type="button" className={`rte-btn ${toolbarState.bold ? 'active' : ''}`} onMouseDown={onToolbarMouseDown} onClick={() => exec('bold')}>
          B
        </button>
        <button type="button" className={`rte-btn ${toolbarState.italic ? 'active' : ''}`} onMouseDown={onToolbarMouseDown} onClick={() => exec('italic')}>
          I
        </button>
        <button type="button" className={`rte-btn ${toolbarState.underline ? 'active' : ''}`} onMouseDown={onToolbarMouseDown} onClick={() => exec('underline')}>
          U
        </button>
        <button type="button" className={`rte-btn ${toolbarState.strike ? 'active' : ''}`} onMouseDown={onToolbarMouseDown} onClick={() => exec('strikeThrough')}>
          S
        </button>

        <button type="button" className={`rte-btn ${toolbarState.ul ? 'active' : ''}`} onMouseDown={onToolbarMouseDown} onClick={() => exec('insertUnorderedList')}>
          • List
        </button>
        <button type="button" className={`rte-btn ${toolbarState.ol ? 'active' : ''}`} onMouseDown={onToolbarMouseDown} onClick={() => exec('insertOrderedList')}>
          1. List
        </button>

        <button type="button" className={`rte-btn ${toolbarState.link ? 'active' : ''}`} onMouseDown={onToolbarMouseDown} onClick={insertLink}>
          Link
        </button>
        <button type="button" className="rte-btn" onMouseDown={onToolbarMouseDown} onClick={() => exec('unlink')}>
          Unlink
        </button>

        <button
          type="button"
          className="rte-btn"
          onMouseDown={onToolbarMouseDown}
          onClick={() => fileInputRef.current?.click()}
        >
          Image
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => insertImage(e.target.files?.[0])}
        />
      </div>

      <div
        ref={editorRef}
        className="rte-editor"
        contentEditable
        suppressContentEditableWarning
        dir="ltr"
        data-placeholder={placeholder}
        onInput={() => {
          emitHtmlIfChanged();
          scheduleRefresh();
        }}
        onBlur={emitHtmlIfChanged}
        onKeyUp={() => {
          saveSelectionIfInsideEditor();
          scheduleRefresh();
        }}
        onMouseUp={() => {
          saveSelectionIfInsideEditor();
          scheduleRefresh();
        }}
        onFocus={scheduleRefresh}
      />
    </div>
  );
}


