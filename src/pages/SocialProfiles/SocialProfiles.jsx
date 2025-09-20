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
  const [newProfile, setNewProfile] = useState({ entityid: '', platform: '', url: '', followers: '' })

  useEffect(() => {
    // Fetch all social profiles
    fetch('/api/socialprofiles')
      .then((response) => response.json())
      .then((data) => setProfiles(data))
      .catch((error) => console.error('Error fetching social profiles:', error))

    // Fetch all entities to populate the dropdown
    fetch('/api/entities')
      .then((response) => response.json())
      .then((data) => setEntities(data))
      .catch((error) => console.error('Error fetching entities:', error))
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewProfile({ ...newProfile, [name]: value })
  }

  const handleAddProfile = () => {
    const profileData = {
      ...newProfile,
      entityid: parseInt(newProfile.entityid, 10),
      followers: newProfile.followers ? parseInt(newProfile.followers, 10) : null,
    }

    fetch('/api/socialprofiles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    })
      .then((response) => response.json())
      .then((addedProfile) => {
        if (addedProfile.error) {
          console.error('Error adding profile:', addedProfile.error)
          alert(`Error: ${addedProfile.error}`)
        } else {
          // To display the name instead of just the ID, we can refetch or manually add it.
          // For simplicity, we refetch the list.
          fetch('/api/socialprofiles')
            .then((response) => response.json())
            .then((data) => setProfiles(data))

          setVisible(false)
          setNewProfile({ entityid: '', platform: '', url: '', followers: '' })
        }
      })
      .catch((error) => console.error('Error adding social profile:', error))
  }

  const entityNameMap = entities.reduce((acc, entity) => {
    acc[entity.entityid] = entity.name
    return acc
  }, {})

  return (
    <CContainer>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Social Profiles</h1>
        <CButton color="primary" onClick={() => setVisible(!visible)}>
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
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>

      <CModal visible={visible} onClose={() => setVisible(false)}>
        <CModalHeader>
          <CModalTitle>Add New Social Profile</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CFormSelect
              name="entityid"
              label="Entity"
              value={newProfile.entityid}
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
              placeholder="e.g., Twitter, Facebook"
              value={newProfile.platform}
              onChange={handleInputChange}
              className="mb-3"
            />
            <CFormInput
              type="text"
              name="url"
              label="URL"
              placeholder="Enter profile URL"
              value={newProfile.url}
              onChange={handleInputChange}
              className="mb-3"
            />
            <CFormInput
              type="number"
              name="followers"
              label="Followers"
              placeholder="Enter number of followers"
              value={newProfile.followers}
              onChange={handleInputChange}
            />
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setVisible(false)}>
            Close
          </CButton>
          <CButton color="primary" onClick={handleAddProfile}>
            Save Profile
          </CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  )
}

export default SocialProfiles
