import { useMemo, useState } from 'react'
import { FiEdit2, FiLock, FiPlus, FiShield, FiUsers } from 'react-icons/fi'
import { addAuditRecord } from '../data/auditStore.js'
import './UserManagement.css'

const roles = ['Admin', 'Plant Manager', 'Production Operator', 'QC Analyst', 'QC Head', 'Supervisor', 'Maintenance', 'Sales', 'Accounts']
const departments = ['Administration', 'Plant Operations', 'Production', 'Quality Control', 'Maintenance', 'Sales', 'Accounts']
const statuses = ['Active', 'Inactive']
const permissions = ['View', 'Create', 'Edit', 'Approve', 'Release', 'Export']

const rolePermissions = {
  Admin: ['View', 'Create', 'Edit', 'Approve', 'Release', 'Export'],
  'Plant Manager': ['View', 'Create', 'Edit', 'Approve', 'Release', 'Export'],
  'Production Operator': ['View', 'Create', 'Edit'],
  'QC Analyst': ['View', 'Create', 'Edit', 'Approve'],
  'QC Head': ['View', 'Create', 'Edit', 'Approve', 'Release', 'Export'],
  Supervisor: ['View', 'Approve', 'Export'],
  Maintenance: ['View', 'Create', 'Edit'],
  Sales: ['View', 'Create', 'Export'],
  Accounts: ['View', 'Create', 'Edit', 'Export'],
}

const seededUsers = [
  { id: 'USR-001', name: 'System Admin', email: 'admin@petrogel.com', role: 'Admin', department: 'Administration', status: 'Active', lastLogin: '2026-09-17 08:00' },
  { id: 'USR-002', name: 'A. Fernandes', email: 'a.fernandes@petrogel.com', role: 'Plant Manager', department: 'Plant Operations', status: 'Active', lastLogin: '2026-09-17 07:45' },
  { id: 'USR-003', name: 'R. Gomes', email: 'r.gomes@petrogel.com', role: 'QC Head', department: 'Quality Control', status: 'Active', lastLogin: '2026-09-16 16:20' },
  { id: 'USR-004', name: 'S. Kulkarni', email: 's.kulkarni@petrogel.com', role: 'QC Analyst', department: 'Quality Control', status: 'Active', lastLogin: '2026-09-17 08:12' },
  { id: 'USR-005', name: 'M. Pereira', email: 'm.pereira@petrogel.com', role: 'Production Operator', department: 'Production', status: 'Active', lastLogin: '2026-09-17 06:55' },
  { id: 'USR-006', name: 'J. Singh', email: 'j.singh@petrogel.com', role: 'Supervisor', department: 'Plant Operations', status: 'Active', lastLogin: '2026-09-16 18:02' },
  { id: 'USR-007', name: 'N. Das', email: 'n.das@petrogel.com', role: 'Maintenance', department: 'Maintenance', status: 'Active', lastLogin: '2026-09-16 14:30' },
  { id: 'USR-008', name: 'P. Shah', email: 'p.shah@petrogel.com', role: 'Sales', department: 'Sales', status: 'Inactive', lastLogin: '2026-08-28 11:10' },
  { id: 'USR-009', name: 'K. Rao', email: 'k.rao@petrogel.com', role: 'Accounts', department: 'Accounts', status: 'Active', lastLogin: '2026-09-15 10:25' },
]

const blankForm = { name: '', email: '', role: 'Production Operator', department: 'Production', status: 'Active' }

function UserManagement() {
  const [users, setUsers] = useState(seededUsers)
  const [form, setForm] = useState(blankForm)
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [permissionRole, setPermissionRole] = useState('Admin')
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('All')
  const [departmentFilter, setDepartmentFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [notice, setNotice] = useState('')

  const filteredUsers = useMemo(() => users.filter((user) => {
    const query = search.toLowerCase()
    return (!query || `${user.name} ${user.email} ${user.id}`.toLowerCase().includes(query))
      && (roleFilter === 'All' || user.role === roleFilter)
      && (departmentFilter === 'All' || user.department === departmentFilter)
      && (statusFilter === 'All' || user.status === statusFilter)
  }), [departmentFilter, roleFilter, search, statusFilter, users])

  const updateForm = (field) => (event) => setForm((previous) => ({ ...previous, [field]: event.target.value }))

  const openAdd = () => { setEditingId(null); setForm(blankForm); setShowForm(true); setNotice('') }
  const openEdit = (user) => { setEditingId(user.id); setForm({ name: user.name, email: user.email, role: user.role, department: user.department, status: user.status }); setShowForm(true); setNotice('') }

  const saveUser = (event) => {
    event.preventDefault()
    if (!form.name || !form.email) return
    const id = editingId || `USR-${String(users.length + 1).padStart(3, '0')}`
    setUsers((previous) => editingId
      ? previous.map((user) => user.id === editingId ? { ...user, ...form } : user)
      : [{ ...form, id, lastLogin: '—' }, ...previous])
    addAuditRecord({ user: 'System Admin', role: 'Admin', action: editingId ? 'Edit' : 'Create', module: 'Users & Rights', recordId: id, description: `${editingId ? 'Updated' : 'Created'} user ${form.name} with role ${form.role}.`, status: 'Completed' })
    setNotice(`${editingId ? 'Updated' : 'Added'} ${form.name}.`)
    setShowForm(false)
  }

  const toggleStatus = (user) => {
    const nextStatus = user.status === 'Active' ? 'Inactive' : 'Active'
    setUsers((previous) => previous.map((item) => item.id === user.id ? { ...item, status: nextStatus } : item))
    addAuditRecord({ user: 'System Admin', role: 'Admin', action: 'Edit', module: 'Users & Rights', recordId: user.id, description: `${nextStatus === 'Active' ? 'Activated' : 'Deactivated'} user ${user.name}.`, status: 'Completed' })
    setNotice(`${user.name} is now ${nextStatus.toLowerCase()}.`)
  }

  return (
    <div className="user-management">
      <header className="user-management-header"><div><h1>Users &amp; Rights</h1><p>Manage portal users, roles and module permissions for PETROGEL operations</p></div><div className="admin-mode-badge"><FiLock /> Admin-controlled access</div></header>

      {notice && <div className="user-notice" role="status">{notice}</div>}

      {showForm && <section className="user-panel user-form-panel"><div className="panel-header"><FiUsers className="panel-header-icon" /><h2>{editingId ? 'Edit User' : 'Add User'}</h2></div><form className="user-form-grid" onSubmit={saveUser}><label className="form-field"><span>Name</span><input required value={form.name} onChange={updateForm('name')} /></label><label className="form-field"><span>Email</span><input required type="email" value={form.email} onChange={updateForm('email')} /></label><label className="form-field"><span>Role</span><select value={form.role} onChange={updateForm('role')}>{roles.map((role) => <option key={role}>{role}</option>)}</select></label><label className="form-field"><span>Department</span><select value={form.department} onChange={updateForm('department')}>{departments.map((department) => <option key={department}>{department}</option>)}</select></label><label className="form-field"><span>Status</span><select value={form.status} onChange={updateForm('status')}>{statuses.map((status) => <option key={status}>{status}</option>)}</select></label><div className="form-actions user-form-actions"><button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button><button type="submit" className="btn btn-primary">Save User</button></div></form></section>}

      <section className="user-panel"><div className="panel-header user-list-header"><div className="panel-header-title"><FiUsers className="panel-header-icon" /><h2>User Directory</h2></div><button type="button" className="btn btn-primary add-user-button" onClick={openAdd}><FiPlus /> Add User</button></div><div className="user-filter-grid"><label className="form-field user-search"><span>Search name or email</span><input type="search" placeholder="Search users" value={search} onChange={(event) => setSearch(event.target.value)} /></label><label className="form-field"><span>Role</span><select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}><option>All</option>{roles.map((role) => <option key={role}>{role}</option>)}</select></label><label className="form-field"><span>Department</span><select value={departmentFilter} onChange={(event) => setDepartmentFilter(event.target.value)}><option>All</option>{departments.map((department) => <option key={department}>{department}</option>)}</select></label><label className="form-field"><span>Status</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option>All</option>{statuses.map((status) => <option key={status}>{status}</option>)}</select></label></div><div className="users-table-wrap"><table className="users-table"><thead><tr><th>User ID</th><th>Name</th><th>Email</th><th>Role</th><th>Department</th><th>Status</th><th>Last Login</th><th>Actions</th></tr></thead><tbody>{filteredUsers.map((user) => <tr key={user.id}><td>{user.id}</td><td><strong>{user.name}</strong></td><td>{user.email}</td><td>{user.role}</td><td>{user.department}</td><td><span className={`status-badge user-status-${user.status.toLowerCase()}`}>{user.status}</span></td><td>{user.lastLogin}</td><td><div className="user-actions"><button type="button" className="icon-action" title="Edit User" onClick={() => openEdit(user)}><FiEdit2 /></button><button type="button" className="text-action" onClick={() => toggleStatus(user)}>{user.status === 'Active' ? 'Deactivate' : 'Activate'}</button><button type="button" className="text-action" onClick={() => { setPermissionRole(user.role); setNotice(`Showing permissions for ${user.role}.`) }}>Permissions</button></div></td></tr>)}</tbody></table>{filteredUsers.length === 0 && <div className="users-empty">No users match the selected filters.</div>}</div></section>

      <section className="user-panel permissions-panel"><div className="panel-header"><FiShield className="panel-header-icon" /><h2>Role-Based Permissions</h2></div><div className="permission-toolbar"><label className="form-field"><span>View role permissions</span><select value={permissionRole} onChange={(event) => setPermissionRole(event.target.value)}>{roles.map((role) => <option key={role}>{role}</option>)}</select></label><span className="permission-summary">{(rolePermissions[permissionRole] || []).length} of {permissions.length} permissions enabled</span></div><div className="permissions-table-wrap"><table className="permissions-table"><thead><tr><th>Role</th>{permissions.map((permission) => <th key={permission}>{permission}</th>)}</tr></thead><tbody>{roles.map((role) => <tr className={role === permissionRole ? 'permission-selected' : ''} key={role}><td><strong>{role}</strong></td>{permissions.map((permission) => <td key={permission}><span className={(rolePermissions[role] || []).includes(permission) ? 'permission-yes' : 'permission-no'}>{(rolePermissions[role] || []).includes(permission) ? 'Yes' : '—'}</span></td>)}</tr>)}</tbody></table></div></section>
    </div>
  )
}

export default UserManagement
