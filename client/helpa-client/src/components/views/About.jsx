import React from "react";

export default () => {

    return (
      <div>
        <div id="about-page" className="view-page">
          <div className="col-12 mb-55 container">
          <h1 id="whoarewe" className="center">Who are we</h1>
              We are a network of volunteers that help donators find people in need
              and enable them to donate 
              <ul style={{listStyleType:"disc", marginLeft:"15px"}}>
                <li>contactless</li>
                <li>without proximity</li>
                <li>and without the need for a bank account.</li>
              </ul>
              We pursue a similar approach to couchsurfing.com or craigslist.org. However, as we do
              not make any revenue with this service nor directly deal with
              money, the registration as a legal entity is not required.
              <hr/>
            <h1 className="center">About</h1>
            <div>
              <b>Let us bank the unbankable</b>
              <br />
              Britain has a horrific homelessness crisis.
              <br />
              ~300.000 homeless <small>(Shelter report, 2019)</small>,<br />
              ~11.000 on the streets{" "}
              <small>(London only, CHAIN report, 2020)</small>.
              <br />
              <br />
              But worrisome is not only the ridiculous number of people that are
              homeless...
              <br />
              <div className="blockquote">
                ...it is the fact that nearly everyone else "feel[s] powerless
                to help"
                <br />
                <small>(76%, UK, crisis, 2019)</small>.
              </div>
              Why do people donate to people living on the streets? <br />
              <div className="blockquote">
                Feeling bad for them and carrying spare change.
              </div>
              Not everyone can create a bank account, so
               how will this work in a cashless society?
              <div className="blockquote">...</div>
              With Distributed Ledger Technology (i.e. Blockchain), people living outside the system can now be
              banked outside the system. We empower the homeless by giving them an IOTA
              address in form of a QR code.
              <br />
              <div className="blockquote">
                Few people love the homeless, many love innovation.
              </div>
              This is not an attempt to solve a social issue through
              technological innovation, it is an attempt to solve a social issue
              through excitement about new technologies.
              <br />
              <div className="blockquote">The homeless have IOTA, do you?</div>
              All we do is host a database of QRs and provide selected
              volunteers the ability to cash out for the homeless in return for
              their tokens.
              <br />
              <br />
              You can donate even without the site running and we are happy to
              share the beneficiaries' private keys with relevant platforms.
              <br />
              <br />
              Now, although micro-donations help an affected person mentally and
              get him through the day, they are not a sustainable solution to
              get somebody off the streets. That is why location tracking,
              a digital identity and individual-driven campaigns will be used to
              support volunteers to solve the underlying problem.
              <br />
              <br />
              Regardless of the reason a person ends up on the streets instead
              of receiving or accepting help, who are we to leave these people
              without attention?
            </div>
          </div>
        </div>
      </div>
    );
}