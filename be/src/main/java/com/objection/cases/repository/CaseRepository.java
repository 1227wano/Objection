package com.objection.cases.repository;

import com.objection.cases.entity.Case;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CaseRepository extends JpaRepository<Case,Integer> {

    List<Case> findByUserNoOrderByUpdatedAtDesc(Integer userNo);

}
