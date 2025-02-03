'use client';

import { useState } from 'react';
import { updateSubmissionStatus } from '@/lib/actions';
import type { FormSubmission } from '@/types/form';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Stats } from './components/stats';
import { Filters } from './components/filters';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { ResponseViewer } from './components/response-viewer';
import { useToast } from '@/hooks/use-toast';

const ITEMS_PER_PAGE = 10;

interface DashboardClientProps {
  initialSubmissions: FormSubmission[];
}

export function DashboardClient({ initialSubmissions }: DashboardClientProps) {
  const [submissions, setSubmissions] =
    useState<FormSubmission[]>(initialSubmissions);
  const [selectedSubmission, setSelectedSubmission] =
    useState<FormSubmission | null>(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('pending');
  const [currentPage, setCurrentPage] = useState(1);
  const [view, setView] = useState(true);

  const { toast } = useToast();

  async function handleStatusUpdate(
    id: string,
    status: 'approved' | 'rejected'
  ) {
    try {
      await updateSubmissionStatus(id, status);
      setSelectedSubmission(null);
      setSubmissions(
        submissions.map((sub) => (sub.id === id ? { ...sub, status } : sub))
      );
      toast({
        title: 'Status Updated',
        description: `Application ${
          status === 'approved' ? 'approved' : 'rejected'
        } successfully.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to update application status. Please try again. ${error}`,
        variant: 'destructive',
      });
    }
  }

  const filteredSubmissions = submissions.filter((submission) => {
    const matchesSearch =
      search === '' ||
      `${submission.firstName} ${submission.lastName}`
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      submission.email.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = status === 'all' || submission.status === status;

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredSubmissions.length / ITEMS_PER_PAGE);
  const paginatedSubmissions = filteredSubmissions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button onClick={() => setView(!view)}>
          {view ? 'View Pending & Summary': 'View Stats'}
        </Button>
      </div>
      {view ? (
        <>
          <Stats submissions={submissions} />
          <Card>
            <CardHeader>
              <CardTitle>Application Submissions</CardTitle>
              <CardDescription>
                Review and manage application submissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <Filters
                  search={search}
                  onSearchChange={setSearch}
                  status={status}
                  onStatusChange={setStatus}
                />

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead className="hidden md:table-cell">
                          Company
                        </TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedSubmissions.map((submission) => (
                        <TableRow key={submission.id}>
                          <TableCell>
                            {new Date(
                              `${submission.created_at}`
                            ).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {submission.firstName} {submission.lastName}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {submission.company}
                          </TableCell>
                          <TableCell>
                            <span
                              className={
                                submission.status === 'approved'
                                  ? 'text-green-600'
                                  : submission.status === 'rejected'
                                  ? 'text-red-600'
                                  : 'text-yellow-600'
                              }
                            >
                              {submission.status.charAt(0).toUpperCase() +
                                submission.status.slice(1)}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleStatusUpdate(submission.id, 'approved')
                                }
                              >
                                Accept
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleStatusUpdate(submission.id, 'rejected')
                                }
                              >
                                Reject
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  setSelectedSubmission(submission)
                                }
                              >
                                Review
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage((p) => Math.max(1, p - 1));
                          }}
                          className={
                            currentPage === 1
                              ? 'pointer-events-none opacity-50'
                              : ''
                          }
                        />
                      </PaginationItem>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => (
                          <PaginationItem
                            key={page}
                            className="hidden md:inline-block"
                          >
                            <PaginationLink
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                setCurrentPage(page);
                              }}
                              isActive={currentPage === page}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        )
                      )}
                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage((p) => Math.min(totalPages, p + 1));
                          }}
                          className={
                            currentPage === totalPages
                              ? 'pointer-events-none opacity-50'
                              : ''
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </div>
            </CardContent>
          </Card>
          <Dialog
            open={!!selectedSubmission}
            onOpenChange={() => setSelectedSubmission(null)}
          >
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Review Application</DialogTitle>
                <DialogDescription>
                  Review the application details and make a decision
                </DialogDescription>
              </DialogHeader>

              {selectedSubmission && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium">Name</h4>
                      <p>
                        {selectedSubmission.firstName}{' '}
                        {selectedSubmission.lastName}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium">Email</h4>
                      <p>{selectedSubmission.email}</p>
                    </div>
                    <div>
                      <h4 className="font-medium">Company</h4>
                      <p>{selectedSubmission.company}</p>
                    </div>
                    <div>
                      <h4 className="font-medium">Job Title</h4>
                      <p>{selectedSubmission.jobTitle}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium">About</h4>
                    <p className="whitespace-pre-wrap">
                      {selectedSubmission.about}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium">Links</h4>
                    <p className="whitespace-pre-wrap">
                      {selectedSubmission.links}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium">Goals</h4>
                    <p className="whitespace-pre-wrap">
                      {selectedSubmission.goals}
                    </p>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() =>
                        handleStatusUpdate(selectedSubmission.id, 'rejected')
                      }
                    >
                      Reject
                    </Button>
                    <Button
                      onClick={() =>
                        handleStatusUpdate(selectedSubmission.id, 'approved')
                      }
                    >
                      Approve
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>{' '}
        </>
      ) : (
        <ResponseViewer
          onStatusUpdate={handleStatusUpdate}
          submissions={submissions}
        />
      )}
    </div>
  );
}
