function showPanel(name) {
  document.getElementById('panel-signin').classList.toggle('active', name === 'signin');
  document.getElementById('panel-create').classList.toggle('active', name === 'create');
}
function togglePw(id, btn) {
  const input = document.getElementById(id);
  const showing = input.type === 'text';
  input.type = showing ? 'password' : 'text';
  btn.innerHTML = showing ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
}