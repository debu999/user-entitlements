import React, { useState, useRef, useEffect } from 'react';
import { UserEntitlements as UserEntitlementsType } from '../types/entitlements';

interface UserEntitlementsProps {
  entitlements: UserEntitlementsType;
}

interface DescriptionModalProps {
  title: string;
  description: string | {
    businessTerm: string;
    ruleset: string;
    rule: string;
    entitlementGroup: string;
    function: string;
  };
  onClose: () => void;
}

interface DetailsPanelProps {
  data: {
    businessTerm: string;
    ruleset: string;
    rule: string;
    entitlementGroup: string;
    function: string;
  };
  onClose: () => void;
  position: 'right' | 'bottom';
  onResize: (width: number) => void;
  currentWidth: number;
  onResizeStart: () => void;
  onResizeEnd: () => void;
}

const DescriptionModal: React.FC<DescriptionModalProps> = ({ title, description, onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {typeof description === 'object' ? (
            <table className="modal-table">
              <tbody>
                <tr>
                  <td className="detail-label">Business Term:</td>
                  <td className="detail-value">{description.businessTerm}</td>
                </tr>
                <tr>
                  <td className="detail-label">Ruleset:</td>
                  <td className="detail-value">{description.ruleset}</td>
                </tr>
                <tr>
                  <td className="detail-label">Rule:</td>
                  <td className="detail-value">{description.rule}</td>
                </tr>
                <tr>
                  <td className="detail-label">Entitlement Group:</td>
                  <td className="detail-value">{description.entitlementGroup}</td>
                </tr>
                <tr>
                  <td className="detail-label">Function:</td>
                  <td className="detail-value">{description.function}</td>
                </tr>
              </tbody>
            </table>
          ) : (
            <p>{description}</p>
          )}
        </div>
      </div>
    </div>
  );
};

const DetailsPanel: React.FC<DetailsPanelProps> = ({ 
  data, 
  onClose, 
  position,
  onResize,
  currentWidth,
  onResizeStart,
  onResizeEnd
}) => {
  const [localPosition, setLocalPosition] = useState(position);
  const startX = useRef(0);
  const startWidth = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    startX.current = e.clientX;
    startWidth.current = currentWidth;
    onResizeStart();
    e.preventDefault();
  };

  const togglePosition = () => {
    setLocalPosition(prev => prev === 'right' ? 'bottom' : 'right');
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (localPosition !== 'right') return;
      
      const deltaX = startX.current - e.clientX;
      const newWidth = startWidth.current + deltaX;
      
      if (newWidth >= 200 && newWidth <= 500) {
        onResize(newWidth);
      }
    };

    const handleMouseUp = () => {
      onResizeEnd();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [localPosition, onResize, currentWidth, onResizeEnd]);

  const getPanelStyle = () => {
    if (localPosition === 'right') {
      return { width: `${currentWidth}px` };
    }
    
    return {
      width: '100%'
    };
  };

  return (
    <div 
      className={`details-panel ${localPosition}`}
      style={getPanelStyle()}
    >
      <div className="panel-header">
        <h3>{data.businessTerm} - Details</h3>
        <div className="panel-controls">
          <button 
            className="dock-button"
            onClick={togglePosition}
            title={`Dock to ${localPosition === 'right' ? 'bottom' : 'right'}`}
          />
          <button className="close-button" onClick={onClose}>×</button>
        </div>
      </div>
      <div className="panel-content">
        <div className="panel-content-wrapper">
          <table className="details-table">
            <tbody>
              <tr>
                <td className="detail-label">Business Term:</td>
                <td className="detail-value">{data.businessTerm}</td>
              </tr>
              <tr>
                <td className="detail-label">Ruleset:</td>
                <td className="detail-value">{data.ruleset}</td>
              </tr>
              <tr>
                <td className="detail-label">Rule:</td>
                <td className="detail-value">{data.rule}</td>
              </tr>
              <tr>
                <td className="detail-label">Entitlement Group:</td>
                <td className="detail-value">{data.entitlementGroup}</td>
              </tr>
              <tr>
                <td className="detail-label">Function:</td>
                <td className="detail-value">{data.function}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      {localPosition === 'right' && (
        <div 
          className="resize-handle"
          onMouseDown={handleMouseDown}
        />
      )}
    </div>
  );
};

const UserEntitlements: React.FC<UserEntitlementsProps> = ({ entitlements }) => {
  const [modalData, setModalData] = useState<{ title: string; description: string | {
    businessTerm: string;
    ruleset: string;
    rule: string;
    entitlementGroup: string;
    function: string;
  }; type: string } | null>(null);
  const [selectedRow, setSelectedRow] = useState<{
    businessTerm: string;
    ruleset: string;
    rule: string;
    entitlementGroup: string;
    function: string;
  } | null>(null);
  const [panelWidth, setPanelWidth] = useState(280);
  const [isResizing, setIsResizing] = useState(false);
  const [selectedRulesets, setSelectedRulesets] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchedUsers, setSearchedUsers] = useState<Array<{
    id: string;
    name: string;
    access: Record<string, boolean>;
  }>>([]);
  const [matchingUsers, setMatchingUsers] = useState<Array<{
    id: string;
    name: string;
    access: Record<string, boolean>;
  }>>([]);

  // Mock user data - in a real app, this would come from an API
  const mockUsers: Array<{
    id: string;
    name: string;
    access: Record<string, boolean>;
  }> = [
    { 
      id: '1', 
      name: 'John Doe', 
      access: { 
        'Customer Data': true, 
        'Financial Records': false, 
        'Data Protection': true,
        'Audit Trail': false,
        'Contract Review': false,
        'Document Retention': false
      } 
    },
    { 
      id: '2', 
      name: 'Jane Smith', 
      access: { 
        'Customer Data': true, 
        'Financial Records': true, 
        'Audit Trail': true,
        'Data Protection': false,
        'Contract Review': false,
        'Document Retention': false
      } 
    },
    { 
      id: '3', 
      name: 'Bob Johnson', 
      access: { 
        'Contract Review': true, 
        'Document Retention': true, 
        'Data Protection': false,
        'Customer Data': false,
        'Financial Records': false,
        'Audit Trail': false
      } 
    },
    { 
      id: '4', 
      name: 'Debabrata Patnaik', 
      access: { 
        'Customer Data': true, 
        'Financial Records': true, 
        'Data Protection': true,
        'Audit Trail': true,
        'Contract Review': true,
        'Document Retention': true
      } 
    },
    { 
      id: '5', 
      name: 'Somyashree Patnaik', 
      access: { 
        'Customer Data': Math.random() > 0.5,
        'Financial Records': Math.random() > 0.5,
        'Data Protection': Math.random() > 0.5,
        'Audit Trail': Math.random() > 0.5,
        'Contract Review': Math.random() > 0.5,
        'Document Retention': Math.random() > 0.5
      } 
    },
  ];

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.length >= 2) {
      const filteredUsers = mockUsers.filter(user => 
        user.name.toLowerCase().includes(query.toLowerCase()) &&
        !searchedUsers.some(searched => searched.id === user.id)
      );
      setMatchingUsers(filteredUsers);
    } else {
      setMatchingUsers([]);
    }
  };

  const handleUserSelect = (user: typeof mockUsers[0]) => {
    setSearchedUsers(prev => [...prev, user]);
    setSearchQuery('');
    setMatchingUsers([]);
  };

  const handleUserRemove = (userId: string) => {
    setSearchedUsers(prev => prev.filter(user => user.id !== userId));
  };

  const allRulesets = [
    ...entitlements.rulesets.map(ruleset => ({
      ...ruleset,
      businessTerms: ruleset.businessTerms.map(term => ({
        ...term,
        accessType: ['InternalOtherRead', 'Internal', 'OtherRead', 'Read', 'Write'][Math.floor(Math.random() * 5)]
      }))
    })),
    {
      id: 'compliance',
      name: 'Compliance',
      description: 'Compliance rules and regulations',
      businessTerms: [
        {
          id: 'compliance-1',
          name: 'Data Protection',
          description: 'Data protection and privacy compliance',
          accessType: 'InternalOtherRead'
        },
        {
          id: 'compliance-2',
          name: 'Audit Trail',
          description: 'Audit trail and logging requirements',
          accessType: 'Write'
        }
      ]
    },
    {
      id: 'legal',
      name: 'Legal',
      description: 'Legal requirements and obligations',
      businessTerms: [
        {
          id: 'legal-1',
          name: 'Contract Review',
          description: 'Contract review and approval process',
          accessType: 'Internal'
        },
        {
          id: 'legal-2',
          name: 'Document Retention',
          description: 'Document retention policies',
          accessType: 'OtherRead'
        }
      ]
    }
  ];

  const handleRulesetToggle = (rulesetName: string) => {
    setSelectedRulesets(prev => 
      prev.includes(rulesetName)
        ? prev.filter(name => name !== rulesetName)
        : [...prev, rulesetName]
    );
  };

  const filteredRulesets = selectedRulesets.length === 0
    ? allRulesets
    : allRulesets.filter(ruleset => selectedRulesets.includes(ruleset.name));

  const openModal = (title: string, description: string, type: 'businessTerm' | 'ruleset', data?: any) => {
    if (type === 'businessTerm' && data) {
      setModalData({ 
        title: `${data.businessTerm} - Details`, 
        description: data,
        type: 'businessTerm'
      });
    } else {
      setModalData({ 
        title: `${title} - Details`, 
        description: description,
        type: 'ruleset'
      });
    }
  };

  const closeModal = () => {
    setModalData(null);
  };

  const handleRowClick = (ruleset: any, term: any) => {
    const rowData = {
      businessTerm: term.name,
      ruleset: ruleset.name,
      rule: `Rule for ${term.name}`,
      entitlementGroup: `Group for ${ruleset.name}`,
      function: `Function for ${term.name}`
    };
    setSelectedRow(rowData);
  };

  const handlePanelResize = (width: number) => {
    setPanelWidth(width);
  };

  const handleResizeStart = () => {
    setIsResizing(true);
  };

  const handleResizeEnd = () => {
    setIsResizing(false);
  };

  return (
    <div className="user-entitlements">
      <div className="header-controls">
        <div className="header-title">
          <h1>User Entitlements</h1>
        </div>
        <div className="user-profile">
          <div 
            className="user-avatar"
            data-tooltip="Debabrata Patnaik"
          >
            DP
          </div>
        </div>
      </div>
      
      <div className="user-info">
        <h2>Debabrata Patnaik</h2>
        <p>User ID: {entitlements.userId}</p>
      </div>

      <div className="filters-container">
        <div className="filters-row">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="search-input"
            />
            {matchingUsers.length > 0 && (
              <div className="search-results">
                {matchingUsers.map(user => (
                  <div 
                    key={user.id}
                    className="search-result-item"
                    onClick={() => handleUserSelect(user)}
                  >
                    {user.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="ruleset-filters">
            {allRulesets.map(ruleset => (
              <label key={ruleset.id} className="ruleset-filter">
                <input
                  type="checkbox"
                  checked={selectedRulesets.includes(ruleset.name)}
                  onChange={() => handleRulesetToggle(ruleset.name)}
                />
                {ruleset.name}
              </label>
            ))}
          </div>
        </div>

        <div className="selected-filters">
          {searchedUsers.map(user => (
            <div key={user.id} className="selected-user">
              {user.name}
              <button 
                className="remove-user"
                onClick={() => handleUserRemove(user.id)}
              >
                ×
              </button>
            </div>
          ))}
          {selectedRulesets.map(ruleset => (
            <div key={ruleset} className="selected-ruleset">
              {ruleset}
              <button 
                className="remove-ruleset"
                onClick={() => handleRulesetToggle(ruleset)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
      
      <div 
        className={`table-container ${isResizing ? 'resizing' : ''}`}
      >
        <table className="entitlements-table">
          <thead>
            <tr>
              <th>Ruleset</th>
              <th>Business Term</th>
              <th>Function</th>
              {searchedUsers.map(user => (
                <th key={user.id}>
                  <div className="table-header-user">
                    {user.name}
                    <button 
                      className="delete-user-button"
                      onClick={() => handleUserRemove(user.id)}
                      title="Remove user from table"
                    >
                      🗑️
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredRulesets.map((ruleset) => (
              ruleset.businessTerms.map((term, index) => {
                const rowData = {
                  businessTerm: term.name,
                  ruleset: ruleset.name,
                  rule: `Rule for ${term.name}`,
                  entitlementGroup: `Group for ${ruleset.name}`,
                  function: `Function for ${term.name}`
                };
                return (
                  <tr 
                    key={`${ruleset.id}-${term.id}`}
                    onClick={() => handleRowClick(ruleset, term)}
                    className={selectedRow?.businessTerm === term.name ? 'selected' : ''}
                  >
                    {index === 0 && (
                      <td rowSpan={ruleset.businessTerms.length}>
                        <div className="cell-content">
                          {ruleset.name}
                          <div className="tooltip">
                            <span className="tooltip-text">{ruleset.description}</span>
                          </div>
                          <button 
                            className="info-button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openModal(ruleset.name, ruleset.description, 'ruleset');
                            }}
                            title="View Ruleset Description"
                          >
                            ℹ️
                          </button>
                        </div>
                      </td>
                    )}
                    <td>
                      <div className="cell-content">
                        {term.name}
                        <div className="tooltip">
                          <span className="tooltip-text">{term.description}</span>
                        </div>
                        <button 
                          className="info-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openModal(term.name, term.description, 'businessTerm', rowData);
                          }}
                          title="View Business Term Description"
                        >
                          ℹ️
                        </button>
                      </div>
                    </td>
                    <td>
                      <span className={`access-type ${term.accessType}`}>
                        {term.accessType}
                      </span>
                    </td>
                    {searchedUsers.map(user => (
                      <td key={user.id}>
                        <span className={`access-status ${user.access[term.name] ? 'granted' : 'denied'}`}>
                          {user.access[term.name] ? '✓' : '✗'}
                        </span>
                      </td>
                    ))}
                  </tr>
                );
              })
            ))}
          </tbody>
        </table>
      </div>

      {modalData && (
        <DescriptionModal
          title={modalData.title}
          description={modalData.description}
          onClose={closeModal}
        />
      )}

      {selectedRow && (
        <DetailsPanel
          data={selectedRow}
          onClose={() => setSelectedRow(null)}
          position="right"
          onResize={handlePanelResize}
          currentWidth={panelWidth}
          onResizeStart={handleResizeStart}
          onResizeEnd={handleResizeEnd}
        />
      )}
    </div>
  );
};

export default UserEntitlements; 