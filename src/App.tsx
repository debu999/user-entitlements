import React from 'react';
import './App.css';
import UserEntitlements from './components/UserEntitlements';
import './components/UserEntitlements.css';

// Sample data - in a real application, this would come from an API
const sampleEntitlements = {
  userId: 'user123',
  userName: 'John Doe',
  rulesets: [
    {
      id: 'ruleset1',
      name: 'Financial Ruleset',
      description: 'Rules governing financial operations',
      businessTerms: [
        {
          id: 'term1',
          name: 'Transaction Processing',
          description: 'Process financial transactions',
          accessType: 'write' as const
        },
        {
          id: 'term2',
          name: 'Financial Reports',
          description: 'View financial reports',
          accessType: 'read' as const
        }
      ]
    },
    {
      id: 'ruleset2',
      name: 'HR Ruleset',
      description: 'Rules governing human resources',
      businessTerms: [
        {
          id: 'term3',
          name: 'Employee Records',
          description: 'Manage employee records',
          accessType: 'admin' as const
        },
        {
          id: 'term4',
          name: 'Payroll',
          description: 'View payroll information',
          accessType: 'read' as const
        }
      ]
    }
  ]
};

function App() {
  return (
    <div className="App">
      <UserEntitlements entitlements={sampleEntitlements} />
    </div>
  );
}

export default App;
