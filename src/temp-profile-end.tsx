        {/* Confirmation Modals */}
        <LogoutConfirmation
          isOpen={showLogoutConfirm}
          onClose={() => setShowLogoutConfirm(false)}
          onConfirm={confirmSignOut}
        />

        <AccountDeletionConfirmation
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={confirmDeleteAccount}
          isLoading={isSaving}
        />

        <ConfirmationModal
          isOpen={showDeactivateConfirm}
          onClose={() => setShowDeactivateConfirm(false)}
          onConfirm={confirmDeactivateAccount}
          type="warning"
          title="Deactivate Account"
          description="Are you sure you want to deactivate your account? You can reactivate it by signing in again."
          confirmText="Deactivate Account"
          details={[
            'Your account will be temporarily disabled',
            'You can reactivate by signing in again',
            'Your data will be preserved'
          ]}
          isLoading={isSaving}
          loadingText="Deactivating account..."
        />
      </div>
    </div>
  );
}