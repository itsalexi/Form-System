type FormSubmission = {
  id: string;
  created_at: string;
  status: 'pending' | 'approved' | 'rejected';
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  jobTitle: string;
  address: string;
  phone: string;
  skype: string;
  about: string;
  links: string;
  goals: string;
};
