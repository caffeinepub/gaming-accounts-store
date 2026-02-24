import React, { useState } from 'react';
import { Plus, Trash2, Loader2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAddAdminUsername, useRemoveAdminUsername } from '../../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const INITIAL_ADMINS = ['Frosty'];

export default function AdminWhitelistManager() {
  const queryClient = useQueryClient();
  const [newUsername, setNewUsername] = useState('');
  const [removeTarget, setRemoveTarget] = useState<string | null>(null);

  // Local list stored in React Query cache
  const cachedList = queryClient.getQueryData<string[]>(['adminUsernames']);
  const adminList: string[] = cachedList ?? INITIAL_ADMINS;

  const addAdmin = useAddAdminUsername();
  const removeAdmin = useRemoveAdminUsername();

  const handleAdd = () => {
    const trimmed = newUsername.trim();
    if (!trimmed || trimmed.includes(' ')) {
      toast.error('Username must be non-empty and contain no spaces');
      return;
    }
    if (adminList.includes(trimmed)) {
      toast.error('Username is already in the whitelist');
      return;
    }

    addAdmin.mutate(trimmed, {
      onSuccess: () => {
        const updated = [...adminList, trimmed];
        queryClient.setQueryData(['adminUsernames'], updated);
        setNewUsername('');
        toast.success('Admin user added successfully');
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to add admin user');
      },
    });
  };

  const handleRemove = (username: string) => {
    removeAdmin.mutate(username, {
      onSuccess: () => {
        const updated = adminList.filter(u => u !== username);
        queryClient.setQueryData(['adminUsernames'], updated);
        setRemoveTarget(null);
        toast.success('Admin user removed successfully');
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to remove admin user');
        setRemoveTarget(null);
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-5 h-5 text-primary" />
        <h3 className="font-orbitron text-sm font-bold tracking-wider">ADMIN WHITELIST</h3>
      </div>

      {/* Add new admin */}
      <div className="p-4 rounded-lg border border-border bg-secondary/20 space-y-3">
        <Label className="font-rajdhani tracking-wide text-xs uppercase text-muted-foreground">
          Add Admin Username
        </Label>
        <div className="flex gap-2">
          <Input
            value={newUsername}
            onChange={e => setNewUsername(e.target.value)}
            placeholder="Enter username..."
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            className="flex-1"
          />
          <Button
            onClick={handleAdd}
            disabled={addAdmin.isPending || !newUsername.trim()}
            size="sm"
          >
            {addAdmin.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Admin list */}
      <div className="space-y-2">
        {adminList.length === 0 ? (
          <p className="text-muted-foreground text-sm font-rajdhani text-center py-4">
            No admins in whitelist
          </p>
        ) : (
          adminList.map(username => (
            <div
              key={username}
              className="flex items-center justify-between p-3 rounded-lg border border-border bg-card"
            >
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                <span className="font-rajdhani font-medium">{username}</span>
                {username === 'Frosty' && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-rajdhani">
                    Seed Admin
                  </span>
                )}
              </div>
              {username !== 'Frosty' && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => setRemoveTarget(username)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Remove confirmation */}
      <AlertDialog open={!!removeTarget} onOpenChange={() => setRemoveTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Admin User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <strong>{removeTarget}</strong> from the admin whitelist?
              They will lose access to the admin panel.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => removeTarget && handleRemove(removeTarget)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {removeAdmin.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Remove'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
