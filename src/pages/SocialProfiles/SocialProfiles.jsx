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

const SocialProfiles = () => {
  const [profiles, setProfiles] = useState([])
  const [entities, setEntities] = useState([])
  const [visible, setVisible] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [currentProfile, setCurrentProfile] = useState({ entityid: '', platform: '', url: '', followers: '' })

  const fetchProfiles = () => {
    fetch('/api/socialprofiles')
      .then((response) => response.json())
      .then((data) => setProfiles(data))
      .catch((error) => console.error('Error fetching social profiles:', error))
  }

  const fetchEntities = () => {
    fetch('/api/entities')
      .then((response) => response.json())
      .then((data) => setEntities(data))
      .catch((error) => console.error('Error fetching entities:', error))
  }

  useEffect(() => {
    fetchProfiles()
    fetchEntities()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setCurrentProfile({ ...currentProfile, [name]: value })
  }

  const handleSaveProfile = () => {
    const method = isEditMode ? 'PUT' : 'POST'
    const url = isEditMode ? `/api/socialprofiles/${currentProfile.profileid}` : '/api/socialprofiles'

    const profileData = {
      ...currentProfile,
      entityid: parseInt(currentProfile.entityid, 10),
      followers: currentProfile.followers ? parseInt(currentProfile.followers, 10) : null,
    }

    fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then(err => { throw new Error(err.error) })
        }
        return response.status === 204 ? null : response.json()
      })
      .then(() => {
        fetchProfiles()
        setVisible(false)
      })
      .catch((error) => console.error(`Error ${isEditMode ? 'updating' : 'adding'} profile:`, error.message))
  }

  const openModalForCreate = () => {
    setIsEditMode(false)
    setCurrentProfile({ entityid: '', platform: '', url: '', followers: '' })
    setVisible(true)
  }

  const openModalForEdit = (profile) => {
    setIsEditMode(true)
    setCurrentProfile(profile)
    setVisible(true)
  }

  const handleDeleteProfile = (profileid) => {
    if (window.confirm('Are you sure you want to delete this social profile?')) {
      fetch(`/api/socialprofiles/${profileid}`, {
        method: 'DELETE',
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to delete social profile')
          }
          fetchProfiles()
        })
        .catch(error => console.error('Error deleting social profile:', error.message))
    }
  }

  const entityNameMap = entities.reduce((acc, entity) => {
    acc[entity.entityid] = entity.name
    return acc
  }, {})

  return (
    <CContainer>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Social Profiles</h1>
        <CButton color="primary" onClick={openModalForCreate}>
          Add Social Profile
        </CButton>
      </div>
      <CTable>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>ID</CTableHeaderCell>
            <CTableHeaderCell>Platform</CTableHeaderCell>
            <CTableHeaderCell>URL</CTableHeaderCell>
            <CTableHeaderCell>Followers</CTableHeaderCell>
            <CTableHeaderCell>Entity</CTableHeaderCell>
            <CTableHeaderCell>Actions</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {profiles.map((profile) => (
            <CTableRow key={profile.profileid}>
              <CTableDataCell>{profile.profileid}</CTableDataCell>
              <CTableDataCell>{profile.platform}</CTableDataCell>
              <CTableDataCell>{profile.url}</CTableDataCell>
              <CTableDataCell>{profile.followers}</CTableDataCell>
              <CTableDataCell>{entityNameMap[profile.entityid] || profile.entityid}</CTableDataCell>
              <CTableDataCell>
                <CButton color="light" size="sm" onClick={() => openModalForEdit(profile)} className="me-2">
                  Edit
                </CButton>
                <CButton color="danger" size="sm" onClick={() => handleDeleteProfile(profile.profileid)}>
                  Delete
                </CButton>
              </CTableDataCell>
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>

      <CModal visible={visible} onClose={() => setVisible(false)}>
        <CModalHeader>
          <CModalTitle>{isEditMode ? 'Edit Social Profile' : 'Add New Social Profile'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CFormSelect
              name="entityid"
              label="Entity"
              value={currentProfile.entityid || ''}
              onChange={handleInputChange}
              className="mb-3"
            >
              <option>Select an Entity</option>
              {entities.map((entity) => (
                <option key={entity.entityid} value={entity.entityid}>
                  {entity.name}
                </option>
              ))}
            </CFormSelect>
            <CFormInput
              type="text"
              name="platform"
              label="Platform"
              value={currentProfile.platform || ''}
              onChange={handleInputChange}
              className="mb-3"
            />
            <CFormInput
              type="text"
              name="url"
              label="URL"
              value={currentProfile.url || ''}
              onChange={handleInputChange}
              className="mb-3"
            />
            <CFormInput
              type="number"
              name="followers"
              label="Followers"
              value={currentProfile.followers || ''}
              onChange={handleInputChange}
            />
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setVisible(false)}>
            Close
          </CButton>
          <CButton color="primary" onClick={handleSaveProfile}>
            {isEditMode ? 'Update Profile' : 'Save Profile'}
          </CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  )
}

export default SocialProfiles
