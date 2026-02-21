import React from 'react';

const StatusSection = ({ data }) => {
  return (
    <section className="content-section">
      <div className="section-header">
        <h2>📊 Status</h2>
      </div>
      <div className="section-content">
        <div className="content-grid">
          <div className="content-card">
            <h3>Overall Status</h3>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor 
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud 
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute 
              irure dolor in reprehenderit.
            </p>
          </div>
          
          <div className="content-card">
            <h3>Service Health</h3>
            <p>
              Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque 
              laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi 
              architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia.
            </p>
          </div>
          
          <div className="content-card">
            <h3>Recent Activities</h3>
            <p>
              At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium 
              voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati 
              cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi.
            </p>
          </div>
          
          <div className="content-card">
            <h3>System Notifications</h3>
            <p>
              Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum 
              soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat 
              facere possimus, omnis voluptas assumenda est, omnis dolor repellendus temporibus autem.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatusSection;