import React, { useState, useEffect } from 'react'
import {
  CContainer,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormInput,
  CFormSelect,
} from '@coreui/react'

const Users = () => {
  const [users, setUsers] = useState([])
  const [visible, setVisible] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [currentUser, setCurrentUser] = useState({ name: '', email: '', role: 'user', status: 'active' })

  const fetchUsers = () => {
    fetch('/api/users')
      .then((response) => response.json())
      .then((data) => setUsers(data))
      .catch((error) => console.error('Error fetching users:', error))
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setCurrentUser({ ...currentUser, [name]: value })
  }

  const handleSaveUser = () => {
    const method = isEditMode ? 'PUT' : 'POST'
    const url = isEditMode ? `/api/users/${currentUser.userid}` : '/api/users'

    fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(currentUser),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then(err => { throw new Error(err.error) })
        }
        return response.status === 204 ? null : response.json()
      })
      .then(() => {
        fetchUsers()
        setVisible(false)
      })
      .catch((error) => console.error(`Error ${isEditMode ? 'updating' : 'adding'} user:`, error.message))
  }

  const openModalForCreate = () => {
    setIsEditMode(false)
    setCurrentUser({ name: '', email: '', role: 'user', status: 'active' })
    setVisible(true)
  }

  const openModalForEdit = (user) => {
    setIsEditMode(true)
    setCurrentUser(user)
    setVisible(true)
  }

  const handleDeleteUser = (userid) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      fetch(`/api/users/${userid}`, {
        method: 'DELETE',
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to delete user')
          }
          fetchUsers()
        })
        .catch(error => console.error('Error deleting user:', error.message))
    }
  }

  return (
    <CContainer>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Users</h1>
        <CButton color="primary" onClick={openModalForCreate}>
          Add User
        </CButton>
      </div>
      <CTable>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>ID</CTableHeaderCell>
            <CTableHeaderCell>Name</CTableHeaderCell>
            <CTableHeaderCell>Email</CTableHeaderCell>
            <CTableHeaderCell>Role</CTableHeaderCell>
            <CTableHeaderCell>Status</CTableHeaderCell>
            <CTableHeaderCell>Actions</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {users.map((user) => (
            <CTableRow key={user.userid}>
              <CTableDataCell>{user.userid}</CTableDataCell>
              <CTableDataCell>{user.name}</CTableDataCell>
              <CTableDataCell>{user.email}</CTableDataCell>
              <CTableDataCell>{user.role}</CTableDataCell>
              <CTableDataCell>{user.status}</CTableDataCell>
              <CTableDataCell>
                <CButton color="light" size="sm" onClick={() => openModalForEdit(user)} className="me-2">
                  Edit
                </CButton>
                <CButton color="danger" size="sm" onClick={() => handleDeleteUser(user.userid)}>
                  Delete
                </CButton>
              </CTableDataCell>
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>

      <CModal visible={visible} onClose={() => setVisible(false)}>
        <CModalHeader>
          <CModalTitle>{isEditMode ? 'Edit User' : 'Add New User'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CFormInput
              type="text"
              name="name"
              label="Name"
              value={currentUser.name || ''}
              onChange={handleInputChange}
              className="mb-3"
            />
            <CFormInput
              type="email"
              name="email"
              label="Email"
              value={currentUser.email || ''}
              onChange={handleInputChange}
              className="mb-3"
            />
            <CFormSelect
              name="role"
              label="Role"
              value={currentUser.role || 'user'}
              onChange={handleInputChange}
              className="mb-3"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </CFormSelect>
            <CFormSelect
              name="status"
              label="Status"
              value={currentUser.status || 'active'}
              onChange={handleInputChange}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </CFormSelect>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setVisible(false)}>
            Close
          </CButton>
          <CButton color="primary" onClick={handleSaveUser}>
            {isEditMode ? 'Update User' : 'Save User'}
          </CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  )
}

export default Users
