// frontend/src/contexts/index.js
export { AuthProvider, useAuth } from './AuthContext';
export { ThemeProvider, useTheme } from './ThemeContext';
export { NotificationProvider, useNotification } from './NotificationContext';
export { ModalProvider, useModal } from './ModalContext';
export { SubscriptionProvider, useSubscription } from './SubscriptionContext';
export { ToolsProvider, useTools } from './ToolsContext';

// Combined provider for easy wrapping
export const AppProviders = ({ children }) => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <SubscriptionProvider>
            <ToolsProvider>
              <ModalProvider>
                {children}
              </ModalProvider>
            </ToolsProvider>
          </SubscriptionProvider>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};