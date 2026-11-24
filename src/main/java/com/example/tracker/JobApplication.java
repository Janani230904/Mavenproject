package com.example.tracker;

import jakarta.persistence.*;

@Entity
public class JobApplication {
    public enum Status { APPLIED, INTERVIEW, OFFER, REJECTED }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, length = 100)
    private String company;
    @Column(nullable = false, length = 100)
    private String role;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Status status;

    protected JobApplication() {}

    JobApplication(String company, String role, Status status) {
        update(company, role, status);
    }

    void update(String company, String role, Status status) {
        this.company = company.strip();
        this.role = role.strip();
        this.status = status;
    }

    public Long getId() { return id; }
    public String getCompany() { return company; }
    public String getRole() { return role; }
    public Status getStatus() { return status; }
}
