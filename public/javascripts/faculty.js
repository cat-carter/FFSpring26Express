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

