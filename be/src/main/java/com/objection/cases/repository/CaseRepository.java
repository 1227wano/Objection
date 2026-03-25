package com.objection.cases.repository;

import com.objection.cases.entity.Case;
import com.objection.cases.enums.CaseStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CaseRepository extends JpaRepository<Case,Integer> {

    List<Case> findByUserNoOrderByUpdatedAtDesc(Integer userNo);

    Optional<Case> findByUserNoAndStatus(Integer userNo, CaseStatus status);
}
