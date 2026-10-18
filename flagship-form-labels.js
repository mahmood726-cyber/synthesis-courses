/* Names use the existing visible, provisional translations. No study values change. */
(function () {
  'use strict';
  const body = document.getElementById('studyTableBody');
  if (!body) return;
  const headers = [...body.closest('table').querySelectorAll('thead th')]
    .map(header => header.textContent.trim());
  function labelRows() {
    [...body.rows].forEach((row, rowIndex) => {
      row.querySelectorAll('input').forEach((input, column) => {
        input.setAttribute('aria-label', `${headers[0]} ${rowIndex + 1}: ${headers[column]}`);
      });
    });
  }
  labelRows();
  // Covers adding/removing rows and both story data views, before the next paint.
  new MutationObserver(labelRows).observe(body, {childList: true});
}());
