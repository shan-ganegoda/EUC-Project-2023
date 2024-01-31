package lk.earth.earthuniversity.dao;

import lk.earth.earthuniversity.entity.Operation;
import lk.earth.earthuniversity.entity.Privilege;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface OperationDao extends JpaRepository<Operation,Integer> {

    @Query("select e from Operation e where e.id = :id")
    Operation findByMyId(@Param("id") Integer id);

}
