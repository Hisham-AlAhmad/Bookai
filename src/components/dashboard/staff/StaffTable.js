import styles from '@/styles/dashboard/staff.module.css'

const ROLE_COLORS = {
  owner:   '#c8a96e',
  manager: '#6e9ecf',
  staff:   '#888',
}

export default function StaffTable({ staff, canManage, onEdit, onToggleActive, currentUserId, isOwner }) {
  if (!staff.length) {
    return (
      <div className={styles.empty}>
        <p>No staff members yet. Add your first team member to get started.</p>
      </div>
    )
  }

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Role</th>
            <th>Phone</th>
            <th>Services</th>
            <th>Login</th>
            <th>Active</th>
            {canManage && <th></th>}
          </tr>
        </thead>
        <tbody>
          {staff.map((member) => {
            const isSelfOwner = isOwner && member.id === currentUserId
            return (
              <tr key={member.id} className={`${styles.row} ${!member.active ? styles.rowInactive : ''}`}>
                <td data-label="Name">
                  <div className={styles.nameCell}>
                    <div className={styles.avatar}>
                      {member.name[0].toUpperCase()}
                    </div>
                    <div>
                      <p className={styles.memberName}>{member.name}</p>
                      {member.email && (
                        <p className={styles.memberEmail}>{member.email}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td data-label="Role">
                  <span
                    className={styles.roleBadge}
                    style={{ '--role-color': ROLE_COLORS[member.role] || '#888' }}
                  >
                    {member.role}
                  </span>
                </td>
                <td className={styles.phone} data-label="Phone">
                  {member.phone || <span className={styles.none}>—</span>}
                </td>
                <td data-label="Services">
                  <div className={styles.servicePills}>
                    {member.services.length
                      ? member.services.slice(0, 3).map((ss) => (
                          <span key={ss.service.id} className={styles.servicePill}>
                            {ss.service.name}
                          </span>
                        ))
                      : <span className={styles.none}>All services</span>
                    }
                    {member.services.length > 3 && (
                      <span className={styles.servicePillMore}>
                        +{member.services.length - 3}
                      </span>
                    )}
                  </div>
                </td>
                <td data-label="Login">
                  <span className={member.can_login ? styles.loginYes : styles.loginNo}>
                    {member.can_login ? 'Yes' : 'No'}
                  </span>
                </td>
                <td data-label="Active">
                  {canManage ? (
                    isSelfOwner ? (
                      <span className={styles.loginYes} title="Owner account cannot be deactivated.">
                        Active
                      </span>
                    ) : (
                      <button
                        className={`${styles.toggle} ${member.active ? styles.toggleOn : styles.toggleOff}`}
                        onClick={() => onToggleActive(member)}
                        title={member.active ? 'Deactivate' : 'Activate'}
                      >
                        <span className={styles.toggleThumb} />
                      </button>
                    )
                  ) : (
                    <span className={member.active ? styles.loginYes : styles.loginNo}>
                      {member.active ? 'Active' : 'Inactive'}
                    </span>
                  )}
                </td>
                {canManage && (
                  <td data-label="Actions">
                    <button
                      className={styles.editBtn}
                      onClick={() => onEdit(member)}
                    >
                      Edit
                    </button>
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}