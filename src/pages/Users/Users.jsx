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
} from '@coreui/react'

const Users = () => {
  const [users, setUsers] = useState([])
  const [visible, setVisible] = useState(false)
  const [newUser, setNewUser] = useState({ name: '', email: '', role: '', status: 'active' })

  useEffect(() => {
    fetch('/api/users')
      .then((response) => response.json())
      .then((data) => setUsers(data))
      .catch((error) => console.error('Error fetching users:', error))
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewUser({ ...newUser, [name]: value })
  }

  const handleAddUser = () => {
    fetch('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newUser),
    })
      .then((response) => response.json())
      .then((addedUser) => {
        setUsers([...users, addedUser])
        setVisible(false)
        setNewUser({ name: '', email: '', role: '', status: 'active' })
      })
      .catch((error) => console.error('Error adding user:', error))
  }

  return (
    <CContainer>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Users</h1>
        <CButton color="primary" onClick={() => setVisible(!visible)}>
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
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>

      <CModal visible={visible} onClose={() => setVisible(false)}>
        <CModalHeader>
          <CModalTitle>Add New User</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CFormInput
              type="text"
              name="name"
              label="Name"
              placeholder="Enter user name"
              value={newUser.name}
              onChange={handleInputChange}
              className="mb-3"
            />
            <CFormInput
              type="email"
              name="email"
              label="Email"
              placeholder="Enter email"
              value={newUser.email}
              onChange={handleInputChange}
              className="mb-3"
            />
            <CFormInput
              type="text"
              name="role"
              label="Role"
              placeholder="Enter role"
              value={newUser.role}
              onChange={handleInputChange}
              className="mb-3"
            />
             <CFormInput
              type="text"
              name="status"
              label="Status"
              placeholder="Enter status"
              value={newUser.status}
              onChange={handleInputChange}
            />
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setVisible(false)}>
            Close
          </CButton>
          <CButton color="primary" onClick={handleAddUser}>
            Save User
          </CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  )
}

export default Users
