const endpoint = '/api/applications';
const form = document.querySelector('#application-form');
const rows = document.querySelector('#applications');
const message = document.querySelector('#message');
const save = document.querySelector('#save');
const cancel = document.querySelector('#cancel');
const title = document.querySelector('#form-title');
const fields = form.elements;
const statuses = { APPLIED: 'Applied', INTERVIEW: 'Interview', OFFER: 'Offer', REJECTED: 'Rejected' };
let editingId = null;
let busy = false;

function showMessage(text, error = false) {
  message.textContent = text;
  message.classList.toggle('error', error);
}

async function request(path = '', method = 'GET', data) {
  const options = { method };
  if (data) {
    options.headers = { 'Content-Type': 'application/json' };
    options.body = JSON.stringify(data);
  }
  const response = await fetch(endpoint + path, options);
  if (response.status === 400) throw new Error('Enter a company, a role, and a valid status.');
  if (response.status === 404) throw new Error('This application no longer exists.');
  if (!response.ok) throw new Error('The server could not complete the request.');
  if (response.status !== 204) return response.json();
}

function resetForm() {
  editingId = null;
  form.reset();
  title.textContent = 'Add an application';
  save.textContent = 'Add application';
  cancel.hidden = true;
}

function edit(application) {
  if (busy) return;
  editingId = application.id;
  fields.company.value = application.company;
  fields.role.value = application.role;
  fields.status.value = application.status;
  title.textContent = 'Edit application';
  save.textContent = 'Save changes';
  cancel.hidden = false;
  showMessage('');
  fields.company.focus();
}

function action(label, className, handler) {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = label;
  button.className = className;
  button.addEventListener('click', handler);
  return button;
}

async function refresh() {
  const applications = await request();
  rows.replaceChildren();
  for (const application of applications) {
    const row = rows.insertRow();
    row.insertCell().textContent = application.company;
    row.insertCell().textContent = application.role;
    row.insertCell().textContent = statuses[application.status];
    const actions = document.createElement('div');
    actions.className = 'actions';
    actions.append(
      action('Edit', 'secondary', () => edit(application)),
      action('Delete', 'delete', () => remove(application))
    );
    row.insertCell().append(actions);
  }
  document.querySelector('#empty').hidden = applications.length > 0;
  document.querySelector('#table-wrap').hidden = applications.length === 0;
}

async function mutate(operation, successMessage) {
  if (busy) return;
  busy = true;
  for (const control of fields) control.disabled = true;
  showMessage('');
  try {
    await operation();
    showMessage(successMessage);
    try {
      await refresh();
    } catch {
      showMessage(successMessage + ' Reload the page to refresh the list.', true);
    }
  } catch (error) {
    showMessage(error.message, true);
  } finally {
    busy = false;
    for (const control of fields) control.disabled = false;
  }
}

function remove(application) {
  if (busy || !window.confirm('Delete the application for ' + application.company + '?')) return;
  mutate(async () => {
    await request('/' + application.id, 'DELETE');
    if (editingId === application.id) resetForm();
  }, 'Application deleted.');
}

form.addEventListener('submit', event => {
  event.preventDefault();
  const data = {
    company: fields.company.value.trim(),
    role: fields.role.value.trim(),
    status: fields.status.value
  };
  if (!data.company || !data.role) {
    showMessage('Enter a company and a role.', true);
    return;
  }
  const id = editingId;
  mutate(async () => {
    await request(id === null ? '' : '/' + id, id === null ? 'POST' : 'PUT', data);
    resetForm();
  }, id === null ? 'Application added.' : 'Changes saved.');
});

cancel.addEventListener('click', () => {
  resetForm();
  showMessage('');
});
refresh().catch(() => showMessage('Could not load applications. Reload the page to try again.', true));
