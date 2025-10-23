import { createContext, useContext, useId, useState, useRef, useEffect } from 'react';

// Minimal, accessible Tabs implementation with full ARIA pattern.
// Exports: TabsProvider (default), TabList, Tab, TabPanels, TabPanel

const TabsContext = createContext(null);

export const Tabs = ({ children, defaultIndex = 0, onChange }) => {
  const [index, setIndex] = useState(defaultIndex);
  const id = useId();
  const tabsRef = useRef([]);

  const registerTab = (el, i) => {
    tabsRef.current[i] = el;
  };

  const focusTab = (i) => {
    const el = tabsRef.current[i];
    if (el && el.focus) el.focus();
  };

  const change = (i) => {
    setIndex(i);
    onChange && onChange(i);
  };

  return (
    <TabsContext.Provider value={{ id, index, setIndex: change, tabsRef, registerTab, focusTab }}>
      {children}
    </TabsContext.Provider>
  );
};

export const TabList = ({ children, ...props }) => {
  return (
    <div role="tablist" aria-orientation="horizontal" {...props}>
      {children}
    </div>
  );
};

export const Tab = ({ children, index, className = '', ...props }) => {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('Tab must be used within Tabs');
  const { id, index: activeIndex, setIndex, registerTab, tabsRef } = ctx;
  const tabId = `${id}-tab-${index}`;
  const panelId = `${id}-panel-${index}`;
  const ref = useRef(null);

  useEffect(() => {
    registerTab(ref.current, index);
  }, [index, registerTab]);

  const onKeyDown = (e) => {
    const max = tabsRef.current.length;
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const next = (index + 1) % max;
      setIndex(next);
      tabsRef.current[next]?.focus();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prev = (index - 1 + max) % max;
      setIndex(prev);
      tabsRef.current[prev]?.focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      setIndex(0);
      tabsRef.current[0]?.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      setIndex(max - 1);
      tabsRef.current[max - 1]?.focus();
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIndex(index);
    }
  };

  return (
    <button
      id={tabId}
      ref={ref}
      role="tab"
      aria-selected={activeIndex === index}
      aria-controls={panelId}
      tabIndex={activeIndex === index ? 0 : -1}
      onClick={() => setIndex(index)}
      onKeyDown={onKeyDown}
      className={className}
      {...props}
    >
      {children}
    </button>
  );
};

export const TabPanels = ({ children, ...props }) => {
  return <div {...props}>{children}</div>;
};

export const TabPanel = ({ children, index, ...props }) => {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('TabPanel must be used within Tabs');
  const { id, index: activeIndex } = ctx;
  const panelId = `${id}-panel-${index}`;
  const tabId = `${id}-tab-${index}`;
  return (
    <div
      id={panelId}
      role="tabpanel"
      aria-labelledby={tabId}
      hidden={activeIndex !== index}
      tabIndex={-1}
      {...props}
    >
      {activeIndex === index ? children : null}
    </div>
  );
};

export default Tabs;
