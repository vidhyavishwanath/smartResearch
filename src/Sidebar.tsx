import React from 'react';
import './Sidebar.css';

interface SidebarProps {
  activeTab: string;
  onTabClick: (tab: string) => void;
}

const tabs = [
  { key: 'workspace', label: 'Workspace' },
  { key: 'search', label: 'Search' },
  { key: 'graph', label: 'Graph' },
];

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabClick }) => (
  <nav className="sidebar">
    <ul>
      {tabs.map(tab => (
        <li
          key={tab.key}
          className={activeTab === tab.key ? 'active' : ''}
          onClick={() => onTabClick(tab.key)}
        >
          {tab.label}
        </li>
      ))}
    </ul>
  </nav>
);

export default Sidebar; 