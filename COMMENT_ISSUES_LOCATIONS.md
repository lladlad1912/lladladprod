# Comment Section Issues - Exact File Locations

## File: `frontend/src/components/CommentSection.js`

### Issue 1: Reply Textarea Backwards Typing & Cursor at Beginning
**Location:** Lines 214-237

**Current Code:**
```javascript
<textarea
  key={`reply-${comment.id}`}
  className="form-textarea"
  placeholder="Write a reply..."
  value={replyText}
  onChange={onReplyTextChange}  // ← This is the problem
  rows="2"
  style={{ marginBottom: '0.5rem' }}
  onWheel={(e) => {
    // ... scroll handling code
  }}
  autoFocus
/>
```

**Problem:** 
- `onReplyTextChange` is passed as a prop from parent (line 355)
- The handler is defined at line 127-129
- The textarea is inside `CommentItem` component (line 156) which re-renders
- This causes cursor position issues

**Handler Definition:**
- Line 127-129: `handleReplyTextChange` function
- Line 355: Passed as prop `onReplyTextChange={handleReplyTextChange}`

---

### Issue 2: Main Comment Textarea Scroll Blocking
**Location:** Lines 306-326

**Current Code:**
```javascript
<textarea
  className="form-textarea"
  placeholder="Write a comment..."
  value={newComment}
  onChange={handleNewCommentChange}
  rows="3"
  onWheel={(e) => {
    // Allow scrolling when textarea is focused
    const textarea = e.currentTarget;
    const isScrollingUp = e.deltaY < 0;
    const isScrollingDown = e.deltaY > 0;
    const isAtTop = textarea.scrollTop === 0;
    const isAtBottom = textarea.scrollTop + textarea.clientHeight >= textarea.scrollHeight - 1;
    
    // If at top and scrolling up, or at bottom and scrolling down, allow page scroll
    if ((isAtTop && isScrollingUp) || (isAtBottom && isScrollingDown)) {
      textarea.blur();
      window.scrollBy(0, e.deltaY);
    }
  }}
/>
```

**Problem:**
- The `onWheel` handler might not be working correctly
- The scroll detection logic might be preventing normal scrolling

---

### Issue 3: Reply Textarea Scroll Blocking
**Location:** Lines 222-235 (inside reply textarea)

**Current Code:**
```javascript
onWheel={(e) => {
  // Allow scrolling when textarea is focused
  const textarea = e.currentTarget;
  const isScrollingUp = e.deltaY < 0;
  const isScrollingDown = e.deltaY > 0;
  const isAtTop = textarea.scrollTop === 0;
  const isAtBottom = textarea.scrollTop + textarea.clientHeight >= textarea.scrollHeight - 1;
  
  // If at top and scrolling up, or at bottom and scrolling down, allow page scroll
  if ((isAtTop && isScrollingUp) || (isAtBottom && isScrollingDown)) {
    textarea.blur();
    window.scrollBy(0, e.deltaY);
  }
}}
```

**Problem:**
- Same scroll blocking issue as main comment box

---

## Related Code Sections

### Handler Functions:
- **Line 123-125:** `handleNewCommentChange` - Works fine
- **Line 127-129:** `handleReplyTextChange` - Used for reply textarea

### CommentItem Component:
- **Line 156:** `CommentItem` function definition
- **Line 214-237:** Reply textarea inside CommentItem
- **Line 219:** `onChange={onReplyTextChange}` - This receives the handler as prop

### Props Passing:
- **Line 355:** `onReplyTextChange={handleReplyTextChange}` - Handler passed to CommentItem

---

## Suggested Fixes

1. **For Reply Textarea Typing Issue:**
   - The reply textarea should use an inline handler like the main comment box
   - Or ensure the handler doesn't cause re-renders

2. **For Scroll Blocking:**
   - Simplify the scroll handler
   - Or remove it and use CSS to prevent scroll blocking
   - Or use a different approach to allow page scrolling

---

## File Structure
```
frontend/src/components/CommentSection.js
├── Line 6: CommentSection function
├── Line 123-125: handleNewCommentChange (works)
├── Line 127-129: handleReplyTextChange (used for replies)
├── Line 156: CommentItem component
├── Line 214-237: Reply textarea (PROBLEM AREA)
├── Line 306-326: Main comment textarea (scroll issue)
└── Line 344-357: CommentItem usage with props
```















