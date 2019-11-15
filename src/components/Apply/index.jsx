import { Field, Form, Formik } from 'formik';
import React from 'react';
import './index.scss';

import {
  apply,
  authenticate,
  getApplication,
  getRoles,
  isAuthenticated,
  uploadResume,
} from 'api';

import Loading from 'components/Loading';
import SelectField from 'components/SelectField';
import {
  graduationYears,
  majors,
  schools,
} from './lists';


const EMPTY_APP = {
  firstName: '',
  lastName: '',

  school: '',
  major: '',
  graduationYear: 0,

  interests: [],

  age: 20,
  beginnerInfo: {
    pullRequest: 5,
    technicalSkills: [],
    versionControl: 5,
    yearsExperience: 7,
  },
  extraInfo: '',
  diet: [],
  gender: 'MALE',
  isBeginner: false,
  isOSContributor: true,
  linkedin: 'linkedin.com/in/brian-strauch',
  phone: '6308158395',
  priorAttendance: true,
  shirtSize: 'L',
  skills: [],
  teamMembers: [],
  transportation: 'NONE',
};

export default class Apply extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      isEditing: false,

      application: {},
      resume: undefined,
      page: 0,
    };
  }

  componentDidMount() {
    if (!isAuthenticated()) {
      authenticate('/apply');
      return;
    }

    getRoles().then(roles => {
      if (roles.includes('Applicant')) {
        this.setState({ isEditing: true });
        return getApplication();
      }
      return EMPTY_APP;
    }).then(app => {
      this.setState({
        application: app,
        isLoading: false,
      });
    }).catch(() => {
      this.setState({ isLoading: false });
    });
  }

  onResumeUpload = event => {
    const file = event.target.files[0];
    this.setState({ resume: file });
  }

  back = () => {
    this.setState(prevState => ({ page: prevState.page - 1 }));
  }

  next = () => {
    this.setState(prevState => ({ page: prevState.page + 1 }));
  }

  submit = app => {
    this.setState({ isLoading: true });

    const { isEditing, resume } = this.state;
    const { history } = this.props;

    apply(isEditing, app).then(() => {
      if (resume) {
        return uploadResume(resume).then(() => {
          history.push('/');
        }).catch(() => {
          this.setState({ isLoading: false });
        });
      }
      return {};
    }).catch(() => {
      this.setState({ isLoading: false });
    });
  }

  page1 = () => (
    <div>
      <p>First Name</p>
      <Field
        name="firstName"
        placeholder="Brian"
      />

      <p>Last Name</p>
      <Field
        name="lastName"
        placeholder="Strauch"
      />

      <p>Gender</p>
      <SelectField
        styleHelper
        name="gender"
        placeholder="What is your gender?"
        options={[
          { label: 'Internship', value: 'INTERNSHIP' },
          { label: 'Full-time', value: 'FULLTIME' },
        ]}
      />

      <br />
      <div className="buttons">
        <div></div>
        <button type="button" onClick={this.next}>Next</button>
      </div>
    </div>
  );

  page2 = () => (
    <div>
      <p>School</p>
      <SelectField
        isMulti
        styleHelper
        name="school"
        placeholder="University of Illinois"
        options={schools.map(school => ({ value: school, label: school }))}
      />

      <p>Major</p>
      <SelectField
        styleHelper
        name="major"
        placeholder="Computer Science"
        options={majors.map(major => ({ value: major, label: major }))}
      />

      <p>Graduation Year</p>
      <SelectField
        styleHelper
        name="graduationYear"
        placeholder="2020"
        options={graduationYears.map(year => ({ value: year, label: year }))}
      />

      <div className="buttons">
        <button type="button" onClick={this.back}>Back</button>
        <button type="button" onClick={this.next}>Next</button>
      </div>
    </div>
  );

  page3 = () => (
    <div>
      <p>Career Interests</p>
      <SelectField
        styleHelper
        name="interests"
        placeholder="Internship"
        options={[
          { label: 'Internship', value: 'INTERNSHIP' },
          { label: 'Full-time', value: 'FULLTIME' },
        ]}
      />

      <p>Resume</p>
      <input
        type="file"
        accept="application/pdf"
        onChange={this.onResumeUpload}
      />

      <br />

      <div className="buttons">
        <button type="button" onClick={this.back}>Back</button>
        <button type="submit">Submit</button>
      </div>
    </div>
  );

  render() {
    const { isLoading, application, page } = this.state;
    if (isLoading) {
      return <Loading />;
    }

    const pages = [this.page1, this.page2, this.page3];
    const pageTitles = ["PERSONAL INFO", "EDUCATIONAL", "PROFESSIONAL INFO",
                        "EXPERIENCE", "INTERESTS", "HACKILLINOIS INFO"];

    return (
      <div className="apply">

        <h1>Registration</h1>

        <div className="progress">
          {(() =>
            pageTitles.map((title) => (
              <p className={page == pageTitles.indexOf(title) ? "selected" : ""}>
                {title}
              </p>
            ))
          )()}
        </div>

        <Formik
          initialValues={application}
          enableReinitialize
          onSubmit={this.submit}
          render={() => (
            <Form>
              {pages[page]()}
            </Form>
          )}
        />

      </div>
    );
  }
}
