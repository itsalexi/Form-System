import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { FormSubmission } from '@/types/form';

interface StatsProps {
  submissions: FormSubmission[];
}

export function Stats({ submissions }: StatsProps) {
  const totalSubmissions = submissions.length;
  const approved = submissions.filter((s) => s.status === 'approved').length;
  const rejected = submissions.filter((s) => s.status === 'rejected').length;
  const pending = submissions.filter((s) => s.status === 'pending').length;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Submissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalSubmissions}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Approved</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{approved}</div>
          <p className="text-xs text-muted-foreground">
            {((approved / totalSubmissions) * 100).toFixed(1)}% approval rate
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Rejected</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{rejected}</div>
          <p className="text-xs text-muted-foreground">
            {((rejected / totalSubmissions) * 100).toFixed(1)}% rejection rate
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">{pending}</div>
          <p className="text-xs text-muted-foreground">
            {((pending / totalSubmissions) * 100).toFixed(1)}% awaiting review
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
