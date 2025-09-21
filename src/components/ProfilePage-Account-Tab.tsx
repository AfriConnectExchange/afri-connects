                <TabsContent value="account" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-destructive">Danger Zone</CardTitle>
                      <CardDescription>
                        These actions cannot be undone. Please be careful.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
                          <h4 className="font-medium mb-2">Deactivate Account</h4>
                          <p className="text-sm text-muted-foreground mb-3">
                            Temporarily disable your account. You can reactivate it by signing in again.
                          </p>
                          <Button
                            variant="outline"
                            onClick={handleDeactivateAccount}
                            disabled={isSaving}
                            className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                          >
                            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Deactivate Account
                          </Button>
                        </div>

                        <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
                          <h4 className="font-medium mb-2 text-destructive">Delete Account</h4>
                          <p className="text-sm text-muted-foreground mb-3">
                            Permanently delete your account and all associated data. This action cannot be undone.
                          </p>
                          <Button
                            variant="destructive"
                            onClick={handleDeleteAccount}
                            disabled={isSaving}
                          >
                            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Delete Account Permanently
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>

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
    </div>
  );
}