function filterCourses() {
  const program = document.getElementById('programSelect').value;
  const courseSelect = document.getElementById('courseSelect');

  courseSelect.innerHTML = '<option value="">-- Select your course --</option>';

  if (!program) {
    courseSelect.disabled = true;
    return;
  }

  const filtered = allCourses.filter(c => c.program === program || c.program === 'Both');
  filtered.forEach(course => {
    const option = document.createElement('option');
    option.value = course.id;
    option.textContent = course.code;
    courseSelect.appendChild(option);
  });

  courseSelect.disabled = false;
}

document.addEventListener('DOMContentLoaded', function() {
  document.querySelector('form').addEventListener('submit', function(e) {
    const highTeach = parseInt(document.querySelector('[name="higherTeachingPct"]').value) || 0;
    const lowTeach = parseInt(document.querySelector('[name="lowerTeachingPct"]').value) || 0;
    const highAssess = parseInt(document.querySelector('[name="higherAssessmentPct"]').value) || 0;
    const lowAssess = parseInt(document.querySelector('[name="lowerAssessmentPct"]').value) || 0;

    if (highTeach + lowTeach !== 100) {
      e.preventDefault();
      alert('Teaching percentages must add up to 100%');
      return;
    }
    if (highAssess + lowAssess !== 100) {
      e.preventDefault();
      alert('Assessment percentages must add up to 100%');
      return;
    }
  });
});

function updateFilename(inputId, spanId) {
  const input = document.getElementById(inputId);
  const span = document.getElementById(spanId);
  span.textContent = input.files.length > 0 ? input.files[0].name : 'No file chosen';
}