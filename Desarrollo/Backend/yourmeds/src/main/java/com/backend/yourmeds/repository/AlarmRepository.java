package com.backend.yourmeds.repository;

import com.backend.yourmeds.entity.Alarm;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AlarmRepository extends JpaRepository<Alarm, Long> {
    List<Alarm> findByGroup_IdOrderByDateStartAsc(Long groupId);
}
